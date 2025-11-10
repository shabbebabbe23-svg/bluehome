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

const AgentGrid = ({ searchQuery = "" }: AgentGridProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        
        // Fetch all agents (users with role 'maklare')
        const { data: agentRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('user_type', 'maklare');

        if (rolesError) throw rolesError;

        if (agentRoles && agentRoles.length > 0) {
          const agentIds = agentRoles.map(role => role.user_id);
          
          let query = supabase
            .from('profiles')
            .select('*')
            .in('id', agentIds);

          // Apply search filter if provided
          if (searchQuery.trim()) {
            query = query.or(
              `full_name.ilike.%${searchQuery}%,` +
              `agency.ilike.%${searchQuery}%,` +
              `area.ilike.%${searchQuery}%,` +
              `office.ilike.%${searchQuery}%`
            );
          }

          const { data, error } = await query;

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
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">
          {searchQuery.trim() 
            ? `Inga mäklare hittades för "${searchQuery}"`
            : "Inga mäklare hittades"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {agents.map((agent) => (
        <Card 
          key={agent.id} 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/agent/${agent.id}`)}
        >
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={agent.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(agent.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{agent.full_name || "Mäklare"}</h3>
              {agent.agency && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Building className="w-4 h-4" />
                  <span className="truncate">{agent.agency}</span>
                </div>
              )}
            </div>
          </div>

          {agent.bio && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {agent.bio}
            </p>
          )}

          <div className="space-y-2 mb-4">
            {agent.area && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{agent.area}</span>
              </div>
            )}
            {agent.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{agent.phone}</span>
              </div>
            )}
            {agent.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{agent.email}</span>
              </div>
            )}
          </div>

          <Button 
            className="w-full" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/agent/${agent.id}`);
            }}
          >
            Visa profil
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default AgentGrid;
