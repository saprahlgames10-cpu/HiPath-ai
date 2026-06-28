import Link from "next/link";
import { ArrowRight, BrainCircuit, Target, Sparkles, Map, Users, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background font-[family-name:var(--font-geist-sans)] selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Map className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">HiPath AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/signup">
              <button className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all shadow-sm">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center space-y-8 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4" /> The future of personalized learning
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-balance">
              Your <span className="text-primary relative whitespace-nowrap">Personal AI<svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg></span> Learning Navigator.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 text-balance">
              Stop wandering through endless tutorials. HiPath AI generates a tailored roadmap, quizzes you dynamically, and guides you to mastery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                  Start Your Journey <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/50 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">A complete learning ecosystem</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to master a new skill, built specifically for the way you learn best.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <Map className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">AI-Generated Roadmaps</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tell us what you want to learn, and our AI builds a structured, week-by-week curriculum instantly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">Dynamic Quizzing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Never compromise the quiz gate. Pass dynamic assessments to unlock the next level, ensuring true mastery.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                <div className="w-14 h-14 bg-success/10 text-success rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">Weakness Targeting</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We track the exact concepts you struggle with and continuously adapt your path until you get it right.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Community & Motivation Section */}
        <section className="py-24 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-foreground text-sm font-medium">
                  <Users className="w-4 h-4" /> Community Driven
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-heading leading-tight">
                  Learn independently,<br/>but never alone.
                </h2>
                <p className="text-xl text-muted-foreground">
                  Earn achievements for your hard work, showcase your milestone wall on your public profile, and get kudos from peers on the same journey.
                </p>
                <ul className="space-y-4">
                  {[
                    "Earn effort-based milestones as you progress",
                    "Share your public learning profile",
                    "Celebrate wins in the community feed"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                      <div className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center">
                        <Trophy className="w-3 h-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full bg-muted rounded-3xl border p-8 relative overflow-hidden h-[400px]">
                {/* Abstract mockup representation */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/40 to-background/5" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[120%] bg-card rounded-xl border shadow-2xl p-6 space-y-4 transform rotate-[-2deg]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">JD</div>
                    <div>
                      <div className="font-bold text-sm">John Doe</div>
                      <div className="text-xs text-muted-foreground">Just now</div>
                    </div>
                  </div>
                  <div className="bg-success/10 text-success border border-success/20 px-4 py-3 rounded-lg text-sm font-medium">
                    🏆 Reached a new milestone: &quot;React Foundations Mastered&quot;
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-muted rounded-md" />
                    <div className="h-8 w-16 bg-muted rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 bg-foreground text-background">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold font-heading">Ready to map your path?</h2>
            <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto">
              Join HiPath AI today and transform the way you learn forever. No more tutorials, just mastery.
            </p>
            <div className="pt-4">
              <Link href="/signup">
                <button className="bg-background text-foreground px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-xl">
                  Create Your Free Account
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} HiPath AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
