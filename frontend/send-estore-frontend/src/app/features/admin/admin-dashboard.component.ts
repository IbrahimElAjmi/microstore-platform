import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { CatalogService } from '@core/services/catalog.service';
import { InventoryResponse, InventoryService } from '@core/services/inventory.service';
import { CategoryResponse, ProductDTO, ProductResponse, UserResponse, OrderResponse } from '@core/models';
import { SiteContent, SiteContentService } from '@core/services/site-content.service';
import { OrderService } from '@core/services/order.service';

interface AdminProduct extends ProductResponse {
  stock?: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  products: AdminProduct[] = [];
  clients: UserResponse[] = [];
  categories: CategoryResponse[] = [];
  orders: OrderResponse[] = [];
  productForm: FormGroup;
  categoryForm: FormGroup;
  clientForm: FormGroup;
  aboutForm: FormGroup;
  editingProduct: AdminProduct | null = null;
  editingCategory: CategoryResponse | null = null;
  editingClient: UserResponse | null = null;
  isLoading = true;
  isSaving = false;
  isClientSaving = false;
  isCategorySaving = false;
  activeTab: 'catalog' | 'clients' | 'reservations' | 'pages' = 'catalog';
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private catalogService: CatalogService,
    private inventoryService: InventoryService,
    private siteContentService: SiteContentService,
    private orderService: OrderService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      categoryId: [null, Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]]
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    this.clientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(4)]]
    });

    this.aboutForm = this.fb.group({
      title: ['', Validators.required],
      subtitle: ['', Validators.required],
      story: ['', Validators.required],
      mission: ['', Validators.required],
      values: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.loadPageForms();
    this.loadDashboard();
  }

  loadPageForms(): void {
    const content = this.siteContentService.getContent();
    this.aboutForm.patchValue(content.about);
  }

  loadDashboard(): void {
    this.isLoading = true;
    forkJoin({
      products: this.catalogService.getProducts().pipe(catchError(() => of([] as ProductResponse[]))),
      categories: this.catalogService.getCategories().pipe(catchError(() => of([] as CategoryResponse[]))),
      users: this.authService.getUsers().pipe(catchError(() => of([] as UserResponse[]))),
      orders: this.orderService.getOrders().pipe(catchError(() => of([] as OrderResponse[])))
    }).pipe(
      switchMap(({ products, categories, users, orders }) => {
        this.categories = categories;
        this.clients = users.filter((user) => user.role === 'CLIENT');
        this.orders = orders;

        if (!products.length) {
          return of([] as AdminProduct[]);
        }

        return forkJoin(products.map((product) =>
          this.inventoryService.getInventory(product.id).pipe(
            map((inventory: InventoryResponse) => ({ ...product, stock: inventory.quantity })),
            catchError(() => of({ ...product, stock: undefined }))
          )
        ));
      }),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (products) => this.products = products,
      error: () => this.errorMessage = 'Impossible de charger le tableau de bord admin.'
    });
  }

  saveProduct(): void {
    if (this.productForm.invalid || this.isSaving) {
      this.productForm.markAllAsTouched();
      return;
    }

    const adminId = this.authService.getUserId();
    const formValue = this.productForm.value;
    const dto: ProductDTO = {
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      imageUrl: formValue.imageUrl,
      categoryId: Number(formValue.categoryId)
    };
    const stock = Number(formValue.stock);
    const request$ = this.editingProduct
      ? this.catalogService.updateProduct(this.editingProduct.id, dto, adminId)
      : this.catalogService.createProduct(dto, adminId);

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    request$.pipe(
      switchMap((product) => this.inventoryService.setStock(product.id, stock).pipe(
        catchError(() => of(null)),
        map(() => product)
      )),
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: () => {
        this.successMessage = this.editingProduct ? 'Produit mis a jour.' : 'Produit cree.';
        this.resetProductForm();
        this.loadDashboard();
      },
      error: () => this.errorMessage = 'Impossible d enregistrer le produit. Verifie les champs et les services backend.'
    });
  }

  editProduct(product: AdminProduct): void {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId,
      stock: product.stock ?? 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(product: AdminProduct): void {
    const adminId = this.authService.getUserId();
    this.successMessage = '';
    this.errorMessage = '';

    this.catalogService.deleteProduct(product.id, adminId).subscribe({
      next: () => {
        this.successMessage = 'Produit supprime.';
        this.loadDashboard();
      },
      error: () => this.errorMessage = 'Impossible de supprimer ce produit.'
    });
  }

  saveClient(): void {
    if (this.clientForm.invalid || this.isClientSaving) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const adminId = this.authService.getUserId();
    const value = this.clientForm.value;
    if (!this.editingClient && !value.password) {
      this.errorMessage = 'Le mot de passe est obligatoire pour creer un client.';
      return;
    }

    const request = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      password: value.password || undefined,
      role: 'CLIENT' as any
    };
    const operation$ = this.editingClient
      ? this.authService.updateClient(this.editingClient.id, request, adminId)
      : this.authService.createClient({
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          password: value.password,
          role: 'CLIENT' as any
        }, adminId);

    this.isClientSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    operation$.pipe(
      finalize(() => this.isClientSaving = false)
    ).subscribe({
      next: () => {
        this.successMessage = this.editingClient ? 'Client mis a jour.' : 'Client cree.';
        this.resetClientForm();
        this.loadDashboard();
      },
      error: () => this.errorMessage = 'Impossible d enregistrer le client. Verifie email, mot de passe et services backend.'
    });
  }

  editClient(client: UserResponse): void {
    this.editingClient = client;
    this.clientForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      password: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteClient(client: UserResponse): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.deleteClient(client.id, this.authService.getUserId()).subscribe({
      next: () => {
        this.successMessage = 'Client supprime.';
        if (this.editingClient?.id === client.id) {
          this.resetClientForm();
        }
        this.loadDashboard();
      },
      error: () => this.errorMessage = 'Impossible de supprimer ce client.'
    });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid || this.isCategorySaving) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isCategorySaving = true;
    const request$ = this.editingCategory
      ? this.catalogService.updateCategory(this.editingCategory.id, this.categoryForm.value, this.authService.getUserId())
      : this.catalogService.createCategory(this.categoryForm.value, this.authService.getUserId());

    request$.pipe(
      finalize(() => this.isCategorySaving = false)
    ).subscribe({
      next: () => {
        this.successMessage = this.editingCategory ? 'Categorie mise a jour.' : 'Categorie creee.';
        this.resetCategoryForm();
        this.loadDashboard();
      },
      error: () => this.errorMessage = 'Impossible d enregistrer la categorie.'
    });
  }

  editCategory(category: CategoryResponse): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || ''
    });
  }

  deleteCategory(category: CategoryResponse): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.catalogService.deleteCategory(category.id, this.authService.getUserId()).subscribe({
      next: () => {
        this.successMessage = 'Categorie supprimee.';
        if (this.editingCategory?.id === category.id) {
          this.resetCategoryForm();
        }
        this.loadDashboard();
      },
      error: () => this.errorMessage = 'Impossible de supprimer cette categorie. Verifie qu elle n est pas utilisee par des produits.'
    });
  }

  updateOrderStatus(orderId: number, status: string): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.successMessage = `Statut de la commande #${orderId} mis a jour.`;
        this.loadDashboard();
      },
      error: () => this.errorMessage = 'Impossible de mettre a jour le statut.'
    });
  }

  resetProductForm(): void {
    this.editingProduct = null;
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      categoryId: this.categories[0]?.id ?? null,
      stock: 0
    });
  }

  resetClientForm(): void {
    this.editingClient = null;
    this.clientForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
  }

  resetCategoryForm(): void {
    this.editingCategory = null;
    this.categoryForm.reset({
      name: '',
      description: ''
    });
  }

  savePages(): void {
    if (this.aboutForm.invalid) {
      this.aboutForm.markAllAsTouched();
      return;
    }

    const currentContent = this.siteContentService.getContent();
    const content: SiteContent = {
      about: this.aboutForm.value,
      contact: currentContent.contact
    };

    this.siteContentService.saveContent(content);
    this.successMessage = 'Page A propos mise a jour.';
    this.errorMessage = '';
  }

  resetPages(): void {
    const content = this.siteContentService.resetContent();
    this.aboutForm.patchValue(content.about);
    this.successMessage = 'Contenu de la page A propos restaure.';
    this.errorMessage = '';
  }

  setTab(tab: 'catalog' | 'clients' | 'reservations' | 'pages'): void {
    this.activeTab = tab;
  }

  formatPrice(price: number): string {
    return `${(price || 0).toFixed(2)} DH`;
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find((category) => category.id === categoryId)?.name || 'Categorie';
  }

  getClientName(customerId: number): string {
    const client = this.clients.find(c => c.id === customerId);
    return client ? `${client.firstName} ${client.lastName}` : `Client #${customerId}`;
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : `Produit #${productId}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}
