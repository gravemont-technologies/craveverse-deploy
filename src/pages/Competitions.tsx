import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Users, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SylviaChat from "@/components/SylviaChat";

const Competitions = () => {
  const [teamName, setTeamName] = useState("");
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("");
  const [points, setPoints] = useState("");
  const { toast } = useToast();
  const [proofs, setProofs] = useState<Record<string, string[]>>(
    JSON.parse(localStorage.getItem("proofs") || "{}")
  );

  const handleCreateTeam = () => {
    if (!teamName || !goal || !category || !points) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const team = {
      teamName,
      goal,
      category,
      points: parseInt(points),
      members: 1,
    };

    const teams = JSON.parse(localStorage.getItem("teams") || "[]");
    teams.push(team);
    localStorage.setItem("teams", JSON.stringify(teams));

    toast({
      title: "Team created!",
      description: `${teamName} is ready for action`,
    });

    setTeamName("");
    setGoal("");
    setCategory("");
    setPoints("");
  };

  const teams = JSON.parse(localStorage.getItem("teams") || "[]");

  const handleUpload = (teamName: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = { ...proofs };
      updated[teamName] = [...(updated[teamName] || []), dataUrl];
      setProofs(updated);
      localStorage.setItem("proofs", JSON.stringify(updated));
      toast({ title: "Proof saved locally", description: "Great accountability!" });
    };
    reader.readAsDataURL(file);
  };

  const removeProof = (teamName: string, idx: number) => {
    const updated = { ...proofs };
    updated[teamName]?.splice(idx, 1);
    setProofs(updated);
    localStorage.setItem("proofs", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-display mb-2">Team Competitions</h1>
          <p className="text-muted-foreground">Create or join team challenges. Upload photo proof of your progress daily to stay accountable!</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Create Team */}
          <Card className="card-elevated">
            <h2 className="text-heading mb-6">Create Team</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-primary"
                  placeholder="Iron Warriors"
                />
              </div>

              <div>
                <Label htmlFor="goal">Goal</Label>
                <Input
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="input-primary"
                  placeholder="30-day sugar-free"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="input-primary">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sugar">Sugar</SelectItem>
                    <SelectItem value="NoFap">NoFap</SelectItem>
                    <SelectItem value="Smoking">Smoking</SelectItem>
                    <SelectItem value="Procrastination">Procrastination</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="points">Target Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="input-primary"
                  placeholder="100"
                />
              </div>

              <Button onClick={handleCreateTeam} className="btn-hero w-full">
                <Trophy className="mr-2" />
                Create Team
              </Button>
            </div>
          </Card>

          {/* Active Teams */}
          <div className="space-y-4">
            <h2 className="text-heading">Active Teams</h2>
            
            {teams.length === 0 ? (
              <Card className="card-elevated text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No teams yet. Create one to get started!</p>
              </Card>
            ) : (
              teams.map((team: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-elevated hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{team.teamName}</h3>
                        <p className="text-sm text-muted-foreground">{team.category}</p>
                      </div>
                      <Trophy className="text-primary" />
                    </div>
                    
                    <p className="mb-4">{team.goal}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        <Users className="w-4 h-4 inline mr-1" />
                        {team.members} members
                      </span>
                      <span className="font-bold text-primary">
                        Target: {team.points} pts
                      </span>
                    </div>
                    
                    <label className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent/10">
                      <Upload className="w-4 h-4" />
                      <span>Upload Proof</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleUpload(team.teamName, e.target.files?.[0]||null)} />
                    </label>

                    {proofs[team.teamName]?.length ? (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {proofs[team.teamName].map((src, i) => (
                          <div key={i} className="relative group">
                            <img src={src} className="w-full h-20 object-cover rounded" />
                            <button onClick={()=>removeProof(team.teamName, i)} className="absolute -top-2 -right-2 bg-card border border-border rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
      <SylviaChat />
    </div>
  );
};

export default Competitions;
