export { apiClient } from './apiClient';
export type { RequestOptions } from './apiClient';
export { authService } from './auth';
export type { SendOtpPayload, VerifyOtpPayload, AuthUser, AuthUserRole, AuthResponseData } from './auth';
export { categoryService } from './categories';
export type {
  Category,
  CategoryStatus,
  ListCategoriesParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryImageContentType,
  PresignedUpload,
} from './categories';
export { attributeService, attributeSupportsColor } from './attributes';
export type {
  Attribute,
  AttributeValue,
  ListAttributesParams,
  ListAttributeValuesParams,
  CreateAttributePayload,
  UpdateAttributePayload,
  CreateAttributeValuePayload,
  UpdateAttributeValuePayload,
} from './attributes';
export { productService } from './products';
export type {
  ProductStatus,
  ProductVariantStatus,
  ProductCategorySummary,
  ProductAttributeSummary,
  ProductAttributeValueSummary,
  Inventory,
  VariantAttribute,
  ProductVariant,
  ProductImage,
  ProductListItem,
  ProductDetail,
  ListProductsParams,
  VariantInventoryInput,
  CreateVariantPayload,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateVariantPayload,
  SetInventoryPayload,
  AdjustInventoryPayload,
  ProductImageContentType,
  CreateProductImagePayload,
  UpdateProductImagePayload,
} from './products';
