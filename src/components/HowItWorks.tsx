import { Button } from './ui/button';

export function HowItWorks({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="container py-12">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="text-center"><div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div><h3 className="font-bold mb-2">Browse Campaigns</h3><p className="text-sm text-muted-foreground">Find products you love at wholesale prices</p></div>
        <div className="text-center"><div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div><h3 className="font-bold mb-2">Join Campaign</h3><p className="text-sm text-muted-foreground">Reserve your spot with a small deposit</p></div>
        <div className="text-center"><div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div><h3 className="font-bold mb-2">Save Big</h3><p className="text-sm text-muted-foreground">Get your product at wholesale price</p></div>
      </div>
      <div className="text-center"><Button size="lg" onClick={onGetStarted}>Get Started</Button></div>
    </section>
  );
}
