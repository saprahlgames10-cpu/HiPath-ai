-- This SQL should be run in the Supabase SQL Editor after running npx prisma db push

-- ============================================================
-- 1. Trigger: auto-create a UserProfile row on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only insert the primary key; all other columns have DB-level defaults
  INSERT INTO public."UserProfile" (id, "createdAt", "updatedAt")
  VALUES (new.id, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 2. Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE public."UserProfile"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Roadmap"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RoadmapWeek"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lesson"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Resource"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."QuizQuestion"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."QuizAttempt"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WeaknessLog"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ReviewQueue"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DailyPlan"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Achievement"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."UserAchievement"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CommunityPublicProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StudyGroup"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StudyGroupMember"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SavedResource"         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS Policies
-- ============================================================

-- UserProfile
CREATE POLICY "Users can view own profile"   ON public."UserProfile" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public."UserProfile" FOR UPDATE USING (auth.uid() = id);

-- Roadmap
CREATE POLICY "Users can manage own roadmaps"             ON public."Roadmap" FOR ALL    USING (auth.uid() = "userId");
CREATE POLICY "Public roadmaps are viewable by everyone"  ON public."Roadmap" FOR SELECT USING ("isPublic" = true);

-- QuizAttempt
CREATE POLICY "Users can manage own QuizAttempts"   ON public."QuizAttempt"  FOR ALL USING (auth.uid() = "userId");

-- WeaknessLog
CREATE POLICY "Users can manage own WeaknessLogs"   ON public."WeaknessLog"  FOR ALL USING (auth.uid() = "userId");

-- ReviewQueue
CREATE POLICY "Users can manage own ReviewQueue"    ON public."ReviewQueue"   FOR ALL USING (auth.uid() = "userId");

-- DailyPlan
CREATE POLICY "Users can manage own DailyPlan"      ON public."DailyPlan"    FOR ALL USING (auth.uid() = "userId");

-- UserAchievement
CREATE POLICY "Users can manage own UserAchievements" ON public."UserAchievement" FOR ALL USING (auth.uid() = "userId");

-- SavedResource
CREATE POLICY "Users can manage own SavedResources" ON public."SavedResource" FOR ALL USING (auth.uid() = "userId");

-- Achievement (public read — anyone can see the global list of achievements)
CREATE POLICY "Achievements are publicly readable" ON public."Achievement" FOR SELECT USING (true);

-- CommunityPublicProfile
CREATE POLICY "Public profiles are viewable by everyone"  ON public."CommunityPublicProfile" FOR SELECT USING (true);
CREATE POLICY "Users can manage own public profile"       ON public."CommunityPublicProfile" FOR ALL    USING (auth.uid() = "userId");

-- StudyGroup (public read)
CREATE POLICY "Study groups are publicly readable" ON public."StudyGroup" FOR SELECT USING (true);

-- StudyGroupMember
CREATE POLICY "Users can manage own study group memberships" ON public."StudyGroupMember" FOR ALL USING (auth.uid() = "userId");

-- RoadmapWeek / Lesson / Resource / QuizQuestion: managed via server-side Prisma (service role).
-- Add permissive read policies so authenticated users can query their own tree via Supabase JS if needed.
CREATE POLICY "Authenticated users can read roadmap weeks" ON public."RoadmapWeek"   FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read lessons"       ON public."Lesson"        FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read resources"     ON public."Resource"      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read quiz questions" ON public."QuizQuestion" FOR SELECT USING (auth.role() = 'authenticated');

