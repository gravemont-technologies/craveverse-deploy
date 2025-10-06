import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfileEditor = () => {
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const { toast } = useToast();

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("userName", name);
    toast({
      title: "Profile updated!",
      description: "Your name has been saved",
    });
  };

  return (
    <Card className="card-elevated">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {name.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-lg">Your Profile</h3>
          <p className="text-sm text-muted-foreground">Manage your identity</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="input-primary"
          />
        </div>

        <Button onClick={handleSave} className="btn-resist w-full">
          <Save className="mr-2" />
          Save Profile
        </Button>
      </div>
    </Card>
  );
};

export default ProfileEditor;
