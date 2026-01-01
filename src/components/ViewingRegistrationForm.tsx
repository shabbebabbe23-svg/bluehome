import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().min(2, "Namn måste vara minst 2 tecken").max(100),
  email: z.string().email("Ogiltig e-postadress").max(255),
  phone: z.string().max(20).optional(),
  message: z.string().max(500).optional(),
});

interface ViewingRegistrationFormProps {
  propertyId: string;
  viewingDate: string;
  viewingDateFormatted: string;
}

export const ViewingRegistrationForm = ({ 
  propertyId, 
  viewingDate,
  viewingDateFormatted 
}: ViewingRegistrationFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("viewing_registrations").insert({
        property_id: propertyId,
        viewing_date: viewingDate,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        message: formData.message?.trim() || null,
      });

      if (error) throw error;

      toast.success("Du är anmäld till visningen!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setIsOpen(false);
    } catch (error) {
      console.error("Error registering for viewing:", error);
      toast.error("Kunde inte anmäla till visning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Calendar className="w-4 h-4" />
          Anmäl intresse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anmäl till visning</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{viewingDateFormatted}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Namn *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ditt namn"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">E-post *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="din@email.se"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="070-123 45 67"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="message">Meddelande</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Eventuella frågor..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Anmäler...
              </>
            ) : (
              "Anmäl till visning"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
