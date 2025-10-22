import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

interface LandingHeroProps {
  onExplore: () => void;
  onLearnMore: () => void;
}

export function LandingHero({ onExplore, onLearnMore }: LandingHeroProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
      <div className="container text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Save Big with Group Buying</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Join campaigns and unlock wholesale prices by purchasing together</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={onExplore}>Explore Campaigns <ArrowRight className="ml-2 h-4 w-4" /></Button>
          <Button size="lg" variant="outline" onClick={onLearnMore}>Learn More</Button>
        </div>
      </div>
    </section>
  );
}
