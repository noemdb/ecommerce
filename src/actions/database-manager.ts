"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function exportDatabase() {
  try {
    const data = {
      users: await prisma.user.findMany(),
      customers: await prisma.customer.findMany(),
      otpTokens: await prisma.oTPToken.findMany(),
      customerActions: await prisma.customerAction.findMany(),
      categories: await prisma.category.findMany(),
      suppliers: await prisma.supplier.findMany(),
      products: await prisma.product.findMany(),
      productImages: await prisma.productImage.findMany(),
      productVariants: await prisma.productVariant.findMany(),
      productPrompts: await prisma.productPrompt.findMany(),
      orders: await prisma.order.findMany(),
      orderItems: await prisma.orderItem.findMany(),
      orderStatusHistory: await prisma.orderStatusHistory.findMany(),
      inventoryMovements: await prisma.inventoryMovement.findMany(),
      reviews: await prisma.review.findMany(),
      siteConfig: await prisma.siteConfig.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
    };
    return { success: true, data: JSON.stringify(data) };
  } catch (error: any) {
    console.error("Error exporting database:", error);
    return { success: false, error: error.message };
  }
}

export async function seedCatalogFromJSON(
  categoriesStr: string,
  productsStr: string,
  imagesStr: string
) {
  try {
    let categories = [];
    let products = [];
    let images = [];

    // Parse if they exist
    if (categoriesStr) categories = JSON.parse(categoriesStr);
    if (productsStr) products = JSON.parse(productsStr);
    if (imagesStr) images = JSON.parse(imagesStr);

    console.log(`Parsed files: ${categories.length} categories, ${products.length} products, ${images.length} images`);

    // 0. Truncate respective tables to ensure clean reload
    // We use CASCADE to handle foreign key dependencies (variants, prompts, movements, etc.)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "categories", "products", "product_images" CASCADE;`);

    // 1. Process Categories
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: { order: cat.order, name: cat.name, slug: cat.slug, isActive: true },
        create: { ...cat, isActive: true },
      });
    }

    // 2. Process Products
    for (const p of products) {
      // Clean up fields that might conflict
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...data } = p;
      await prisma.product.upsert({
        where: { id: data.id },
        update: data,
        create: data,
      });
    }

    // 3. Process Product Images
    for (const img of images) {
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: img,
        create: img,
      });
    }

    revalidatePath("/admin/productos");
    revalidatePath("/admin/categorias");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error running catalog seed:", error);
    return { success: false, error: error.message };
  }
}

export async function importDatabase(jsonDataStr: string) {
  try {
    const backup = JSON.parse(jsonDataStr);

    // This is a highly destructive operation.
    // We execute a TRUNCATE to clear out the data. The order matters for table constraints in Postgres unless CASCADE is used.
    // However, executing TRUNCATE CASCADE requires careful reconnection.
    // For safety during this task without CASCADE destroying system logic unexpectedly, we will just use basic TRUNCATE CASCADE since it's standard PostgreSQL.
    
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "users", 
        "customers", 
        "otp_tokens", 
        "customer_actions", 
        "categories", 
        "suppliers", 
        "products", 
        "product_images", 
        "product_variants", 
        "product_prompts", 
        "orders", 
        "order_items", 
        "order_status_history", 
        "inventory_movements", 
        "reviews", 
        "site_config", 
        "audit_logs" 
      CASCADE;
    `);

    // Insertion needs to respect foreign keys (Categories -> Products, Users -> Orders, etc)
    // Order of Insertion:
    // 1. Independent models
    if (backup.users?.length) {
      for (const item of backup.users) {
        await prisma.user.create({ data: item });
      }
    }
    
    if (backup.siteConfig?.length) {
        for (const item of backup.siteConfig) {
          await prisma.siteConfig.create({ data: item });
        }
    }

    if (backup.customers?.length) {
      for (const item of backup.customers) {
        await prisma.customer.create({ data: item });
      }
    }

    if (backup.categories?.length) {
      for (const item of backup.categories) {
        await prisma.category.create({ data: item });
      }
    }

    if (backup.suppliers?.length) {
      for (const item of backup.suppliers) {
        await prisma.supplier.create({ data: item });
      }
    }

    if (backup.products?.length) {
      for (const item of backup.products) {
        await prisma.product.create({ data: item });
      }
    }

    if (backup.productImages?.length) {
        for (const item of backup.productImages) {
          await prisma.productImage.create({ data: item });
        }
    }

    if (backup.productVariants?.length) {
        for (const item of backup.productVariants) {
          await prisma.productVariant.create({ data: item });
        }
    }

    if (backup.productPrompts?.length) {
        for (const item of backup.productPrompts) {
          await prisma.productPrompt.create({ data: item });
        }
    }

    // Now Orders and related 
    if (backup.orders?.length) {
        for (const item of backup.orders) {
          await prisma.order.create({ data: item });
        }
    }

    if (backup.orderItems?.length) {
        for (const item of backup.orderItems) {
          await prisma.orderItem.create({ data: item });
        }
    }

    if (backup.orderStatusHistory?.length) {
        for (const item of backup.orderStatusHistory) {
          await prisma.orderStatusHistory.create({ data: item });
        }
    }

    if (backup.inventoryMovements?.length) {
        for (const item of backup.inventoryMovements) {
          await prisma.inventoryMovement.create({ data: item });
        }
    }

    if (backup.reviews?.length) {
        for (const item of backup.reviews) {
          await prisma.review.create({ data: item });
        }
    }

    // Customer related logs
    if (backup.otpTokens?.length) {
        for (const item of backup.otpTokens) {
          await prisma.oTPToken.create({ data: item });
        }
    }

    if (backup.customerActions?.length) {
        for (const item of backup.customerActions) {
          await prisma.customerAction.create({ data: item });
        }
    }

    if (backup.auditLogs?.length) {
        for (const item of backup.auditLogs) {
          await prisma.auditLog.create({ data: item });
        }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error importing database:", error);
    return { success: false, error: error.message };
  }
}
