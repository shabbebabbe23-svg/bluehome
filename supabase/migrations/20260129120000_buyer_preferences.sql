-- Create buyer_preferences table to store buyer housing preferences
CREATE TABLE IF NOT EXISTS public.buyer_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Location preferences
    preferred_locations TEXT[] DEFAULT '{}',
    max_commute_minutes INTEGER,
    
    -- Price range
    min_price INTEGER,
    max_price INTEGER,
    
    -- Size preferences
    min_area INTEGER,
    max_area INTEGER,
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    min_bathrooms INTEGER,
    
    -- Property type preferences (Lägenhet, Villa, Radhus, etc.)
    property_types TEXT[] DEFAULT '{}',
    
    -- Important features (boolean checkboxes)
    wants_balcony BOOLEAN DEFAULT FALSE,
    wants_elevator BOOLEAN DEFAULT FALSE,
    wants_fireplace BOOLEAN DEFAULT FALSE,
    wants_garden BOOLEAN DEFAULT FALSE,
    wants_parking BOOLEAN DEFAULT FALSE,
    wants_garage BOOLEAN DEFAULT FALSE,
    wants_near_daycare BOOLEAN DEFAULT FALSE,
    wants_near_school BOOLEAN DEFAULT FALSE,
    wants_near_centrum BOOLEAN DEFAULT FALSE,
    wants_near_public_transport BOOLEAN DEFAULT FALSE,
    wants_near_nature BOOLEAN DEFAULT FALSE,
    wants_near_water BOOLEAN DEFAULT FALSE,
    wants_new_production BOOLEAN DEFAULT FALSE,
    wants_quiet_area BOOLEAN DEFAULT FALSE,
    wants_pet_friendly BOOLEAN DEFAULT FALSE,
    
    -- Max monthly cost (avgift)
    max_monthly_fee INTEGER,
    
    -- Construction year preferences
    min_construction_year INTEGER,
    max_construction_year INTEGER,
    
    -- Email notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('instant', 'daily', 'weekly')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.buyer_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences"
    ON public.buyer_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
    ON public.buyer_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
    ON public.buyer_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
    ON public.buyer_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_buyer_preferences_user_id ON public.buyer_preferences(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_buyer_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_buyer_preferences_updated_at
    BEFORE UPDATE ON public.buyer_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_buyer_preferences_updated_at();
