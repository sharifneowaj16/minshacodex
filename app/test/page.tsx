export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma'

export default async function TestPage() {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
    },
    take: 5,
  })

  const stats = {
    totalProducts: await prisma.product.count(),
    totalBrands: await prisma.brand.count(),
    totalCategories: await prisma.category.count(),
    totalCustomers: await prisma.user.count(),
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Minsah Beauty - Database Test
      </h1>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-bold">Products</h3>
          <p className="text-2xl">{stats.totalProducts}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-bold">Brands</h3>
          <p className="text-2xl">{stats.totalBrands}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-bold">Categories</h3>
          <p className="text-2xl">{stats.totalCategories}</p>
        </div>
        <div className="bg-pink-100 p-4 rounded">
          <h3 className="font-bold">Customers</h3>
          <p className="text-2xl">{stats.totalCustomers}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Sample Products</h2>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-gray-600">Brand: {product.brand?.name}</p>
            <p className="text-gray-600">Category: {product.category?.name}</p>
            <p className="text-green-600 font-bold">৳{product.price.toString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
