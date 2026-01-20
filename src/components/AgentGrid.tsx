import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
export interface Agent {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  area: string | null;
  agency: string | null;
  office: string | null;
  avatar_url: string | null;
  bio: string | null;
}
interface AgentGridProps {
  searchQuery?: string;
}
const AgentGrid = ({
  searchQuery = ""
}: AgentGridProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);

        // Fetch all agents (users with role 'maklare')
        const {
          data: agentRoles,
          error: rolesError
        } = await supabase.from('user_roles').select('user_id').eq('user_type', 'maklare');
        if (rolesError) throw rolesError;
        if (agentRoles && agentRoles.length > 0) {
          const agentIds = agentRoles.map(role => role.user_id);
          let query = supabase.from('profiles').select('*').in('id', agentIds);

          // Apply search filter if provided
          if (searchQuery.trim()) {
            query = query.or(`full_name.ilike.%${searchQuery}%,` + `agency.ilike.%${searchQuery}%,` + `area.ilike.%${searchQuery}%,` + `office.ilike.%${searchQuery}%`);
          }
          const {
            data,
            error
          } = await query;
          if (error) throw error;
          setAgents(data || []);
        } else {
          setAgents([]);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [searchQuery]);
  const getInitials = (name: string | null) => {
    if (!name) return "M";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };
  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {[1, 2, 3].map(i => <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </Card>)}
      </div>;
  }
  if (agents.length === 0) {
    return <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">
          {searchQuery.trim() ? `Inga mäklare hittades för "${searchQuery}"` : "Inga mäklare hittades"}
        </p>
      </div>;
  }
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {agents.map(agent => <Card key={agent.id} onClick={() => navigate(`/agent/${agent.id}`)}
        className="p-3 xs:p-4 sm:p-6 md:px-8 md:py-6 hover:shadow-2xl transition-shadow cursor-pointer mx-0 rounded-xl border-2 border-primary/30 bg-white/95 w-full max-w-full sm:max-w-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8"
        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
      >
          {/* Agent avatar always visible */}
          <div className="flex-shrink-0">
            <Avatar className="w-16 h-16 border border-border">
              {agent.avatar_url ? (
                <AvatarImage src={agent.avatar_url} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials(agent.full_name)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="flex flex-col justify-between flex-1 min-w-0 gap-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
              <h3 className="font-bold text-2xl md:text-2xl text-left mb-1 md:mb-0 break-words w-full">{agent.full_name || "Mäklare"}</h3>
              {agent.agency && <div className="flex items-center gap-2 text-lg text-muted-foreground break-words w-full md:w-auto">
                <Building className="w-5 h-5" />
                <span className="font-medium">{agent.agency}</span>
              </div>}
            </div>
            {agent.bio && <p className="line-clamp-2 text-base text-left text-muted-foreground max-w-full break-words w-full">
              {agent.bio}
            </p>}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 w-full">
              {agent.area && <div className="flex items-center gap-2 text-base break-words w-full md:w-auto">
                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span>{agent.area}</span>
              </div>}
              {agent.phone && <div className="flex items-center gap-2 text-base break-words w-full md:w-auto">
                <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span>{agent.phone}</span>
              </div>}
              {agent.email && <div className="flex items-center gap-2 text-base break-words w-full md:w-auto">
                <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span>{agent.email}</span>
              </div>}
            </div>
            {/* Byrålogga och hemsida */}
            {agent.agency_logo_url && (
              <div className="flex flex-col items-start mt-4">
                <img
                  src={agent.agency_logo_url}
                  alt={agent.agency || 'Byrålogo'}
                  className="h-12 w-auto max-w-[120px] object-contain mb-2 border rounded bg-white"
                />
                {agent.agency_website && (
                  <a href={agent.agency_website} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
                    {agent.agency_website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            )}
            <Button variant="default" size="lg" className="w-full sm:w-auto mt-4 text-lg py-3 font-semibold shadow-md self-start" onClick={e => {
              e.stopPropagation();
              navigate(`/agent/${agent.id}`);
            }}>
              Visa profil
            </Button>
          </div>
        </Card>)}
    </div>;
};
export default AgentGrid;