import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { trackLead } from "@/lib/facebookPixel";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Namn krävs").max(100),
  email: z.string().trim().email("Ogiltig e-postadress").max(255),
  phone: z.string().trim().min(1, "Telefonnummer krävs").max(20),
  message: z.string().trim().min(1, "Meddelande krävs").max(1000)
});

interface ContactFormProps {
  propertyTitle: string;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
}

const ContactForm = ({ propertyTitle, agentName, agentPhone, agentEmail }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = contactSchema.parse(formData);
      
      // Simulate form submission (in real app, send to backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track lead to Facebook Pixel
      trackLead(undefined, 'contact_form');
      
      toast.success("Meddelandet har skickats till mäklaren!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Något gick fel. Försök igen senare.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookViewing = () => {
    const message = `Hej! Jag är intresserad av att boka en visning för ${propertyTitle}.`;
    if (agentPhone) {
      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = agentPhone.replace(/\D/g, '');
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    } else {
      toast.info("Kontaktinformation saknas");
    }
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Kontakta mäklaren
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agentName && (
          <div className="text-sm">
            <p className="font-semibold">{agentName}</p>
            {agentPhone && <p className="text-muted-foreground">{agentPhone}</p>}
            {agentEmail && <p className="text-muted-foreground">{agentEmail}</p>}
          </div>
        )}

        <Button 
          onClick={handleBookViewing}
          className="w-full bg-hero-gradient hover:scale-105 transition-transform"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Boka visning
        </Button>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name">Namn</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ditt namn"
              required
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="din@epost.se"
              required
              maxLength={255}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="070-123 45 67"
              required
              maxLength={20}
            />
          </div>

          <div>
            <Label htmlFor="message">Meddelande</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Jag är intresserad av denna bostad..."
              required
              maxLength={1000}
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Skickar..." : "Skicka meddelande"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
