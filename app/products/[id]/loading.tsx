export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* Nav skeleton */}
      <div className="sticky top-0 z-40 bg-[#3D1F0E] h-12" />

      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Breadcrumb skeleton */}
        <div className="h-3 w-48 bg-[#E8D5C0] rounded-full animate-pulse mb-4" />

        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Image skeleton */}
          <div className="aspect-[4/3] md:aspect-square bg-[#E8D5C0] rounded-3xl animate-pulse" />

          {/* Info skeleton */}
          <div className="px-4 lg:px-0 pt-4 lg:pt-0 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-[#E8D5C0] rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-[#E8D5C0] rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-3/4 bg-[#E8D5C0] rounded-lg animate-pulse" />
              <div className="h-7 w-1/2 bg-[#E8D5C0] rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-32 bg-[#E8D5C0] rounded-lg animate-pulse" />
            <div className="h-px bg-[#E8D5C0]" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-[#E8D5C0] rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-[#E8D5C0] rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-[#E8D5C0] rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-[#E8D5C0] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
