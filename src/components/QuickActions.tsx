import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRightLeft, 
  Download, 
  FileText, 
  Settings, 
  Phone, 
  MapPin,
  Clock,
  Shield
} from "lucide-react";

const quickActions = [
  {
    title: "Transfer Funds",
    description: "Move money between accounts",
    icon: ArrowRightLeft,
    action: "transfer",
    color: "text-primary"
  },
  {
    title: "Download Statement",
    description: "Get account statements",
    icon: Download,
    action: "download",
    color: "text-secondary"
  },
  {
    title: "Pay Bills",
    description: "Pay your bills online",
    icon: FileText,
    action: "bills",
    color: "text-accent"
  },
  {
    title: "Account Settings",
    description: "Manage your preferences",
    icon: Settings,
    action: "settings",
    color: "text-muted-foreground"
  }
];

const bankingServices = [
  {
    title: "24/7 Customer Support",
    icon: Phone,
    description: "Available anytime"
  },
  {
    title: "Find ATM/Branch",
    icon: MapPin,
    description: "Locate nearby services"
  },
  {
    title: "Mobile Banking",
    icon: Clock,
    description: "Bank on the go"
  },
  {
    title: "Security Center",
    icon: Shield,
    description: "Protect your account"
  }
];

export const QuickActions = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <h2 className="text-2xl font-bold text-primary mb-2">Quick Actions</h2>
        <p className="text-muted-foreground">Common banking tasks at your fingertips</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade-in">
        {quickActions.map((action, index) => (
          <Card key={index} className="banking-card hover-lift cursor-pointer group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardContent className="p-6 text-center relative z-10">
              <div className="relative">
                <action.icon className={`h-8 w-8 mx-auto mb-3 ${action.color} group-hover:scale-110 group-hover:animate-float transition-all duration-200`} />
                <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 rounded-full blur-xl transition-opacity duration-300" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 group-hover:text-muted-foreground/80">{action.description}</p>
              <Button size="sm" variant="outline" className="w-full banking-button group-hover:border-primary group-hover:text-primary">
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="banking-card hover-lift animate-scale-in group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardContent className="p-6 relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-primary flex items-center">
            Banking Services
            <div className="ml-2 h-2 w-2 bg-accent rounded-full animate-pulse" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bankingServices.map((service, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer hover:scale-105 group/item">
                <service.icon className="h-6 w-6 text-primary group-hover/item:animate-pulse" />
                <div>
                  <p className="font-medium text-sm group-hover/item:text-primary transition-colors">{service.title}</p>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};