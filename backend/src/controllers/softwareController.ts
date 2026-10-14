import { Request, Response } from 'express';
import { db } from '../services/prisma';
import { createSoftwareSchema } from '../validators/schemas';
import { blockchainSync } from '../services/blockchainSync';

export async function listSoftware(req: Request, res: Response) {
  try {
    const { category, search } = req.query;

    let items = db.store.products.filter(p => p.isActive);

    if (category && category !== 'ALL' && category !== 'undefined') {
      const catStr = String(category).toLowerCase();
      items = items.filter(p => {
        const pCat = p.category.toLowerCase();
        if (pCat === catStr) return true;
        if (catStr.includes('cyber') || catStr.includes('security')) return pCat.includes('security') || pCat.includes('cyber');
        if (catStr.includes('dev')) return pCat.includes('dev');
        if (catStr.includes('data') || catStr.includes('ai')) return pCat.includes('data') || pCat.includes('analytics');
        if (catStr.includes('design')) return pCat.includes('design');
        if (catStr.includes('product')) return pCat.includes('product');
        return pCat.includes(catStr) || catStr.includes(pCat);
      });
    }

    if (search && search !== 'undefined' && String(search).trim() !== '') {
      const q = String(search).toLowerCase().trim();
      items = items.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    // Attach plans and publisher details
    const result = items.map(p => {
      const plans = db.store.plans.filter(pl => pl.productId === p.id);
      const publisher = db.store.users.find(u => u.id === p.publisherId);
      return {
        ...p,
        publisher: publisher ? { id: publisher.id, name: publisher.name, walletAddress: publisher.walletAddress } : null,
        plans,
      };
    });

    return res.json({ success: true, count: result.length, products: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getSoftwareByIdOrSlug(req: Request, res: Response) {
  try {
    const { idOrSlug } = req.params;
    const product = db.store.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Software product not found' });
    }

    const plans = db.store.plans.filter(pl => pl.productId === product.id);
    const publisher = db.store.users.find(u => u.id === product.publisherId);

    return res.json({
      success: true,
      product: {
        ...product,
        publisher: publisher ? { id: publisher.id, name: publisher.name, walletAddress: publisher.walletAddress } : null,
        plans,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createSoftware(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const validated = createSoftwareSchema.parse(req.body);

    const baseSlug = validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (db.store.products.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newProduct = {
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: validated.name,
      slug,
      description: validated.description,
      category: validated.category,
      version: validated.version || '1.0.0',
      imageUrl: validated.imageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
      publisherId: req.user.id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.store.products.push(newProduct);

    // Create plans
    const createdPlans = validated.plans.map((pl, idx) => {
      const plan = {
        id: `plan-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        productId: newProduct.id,
        name: pl.name,
        licenseType: pl.licenseType,
        durationDays: pl.durationDays,
        maxSeats: pl.maxSeats,
        priceDemo: pl.priceDemo,
        isDefault: pl.isDefault || idx === 0,
        createdAt: new Date(),
      };
      db.store.plans.push(plan);
      return plan;
    });

    db.save();

    blockchainSync.logAudit(req.user.id, 'SOFTWARE_CREATED', 'SoftwareProduct', newProduct.id, {
      name: newProduct.name,
      slug: newProduct.slug,
      plansCount: createdPlans.length,
    });

    return res.status(201).json({
      success: true,
      message: 'Software product and license plans created successfully.',
      product: {
        ...newProduct,
        plans: createdPlans,
      },
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateSoftware(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { id } = req.params;

    const product = db.store.products.find(p => p.id === id);
    if (!product) return res.status(404).json({ success: false, error: 'Software not found' });

    // Authorization check: must be owner publisher or admin
    if (product.publisherId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'You are not authorized to edit this software product.' });
    }

    const { name, description, category, version, imageUrl, isActive } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (version) product.version = version;
    if (imageUrl) product.imageUrl = imageUrl;
    if (typeof isActive === 'boolean') product.isActive = isActive;
    product.updatedAt = new Date();

    db.save();

    blockchainSync.logAudit(req.user.id, 'SOFTWARE_UPDATED', 'SoftwareProduct', product.id);

    return res.json({ success: true, message: 'Software updated successfully.', product });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteSoftware(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { id } = req.params;

    const productIdx = db.store.products.findIndex(p => p.id === id);
    if (productIdx === -1) return res.status(404).json({ success: false, error: 'Software product not found' });

    const product = db.store.products[productIdx];
    if (product.publisherId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this software product.' });
    }

    db.store.products.splice(productIdx, 1);
    db.save();

    blockchainSync.logAudit(req.user.id, 'SOFTWARE_DELETED', 'SoftwareProduct', id, { name: product.name });

    return res.json({ success: true, message: 'Software product deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

