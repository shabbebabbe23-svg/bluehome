const AdBanner = () => {
  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-24 p-4">
        <div className="border border-border rounded-lg bg-card p-6 min-h-[600px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">Annonsplats</p>
            <p className="text-lg font-semibold">300 x 600</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdBanner;
