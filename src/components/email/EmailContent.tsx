
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EmailContentProps {
  content: string;
  from: string;
  onDelete: () => void;
}

const EmailContent = ({ content, from, onDelete }: EmailContentProps) => {
  const copyContent = () => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = content;
    const textContent = tempElement.textContent || tempElement.innerText || "";
    navigator.clipboard.writeText(textContent);
    toast.success("Conteúdo copiado!", {
      description: "Agora é só colar onde precisar!",
      icon: "👍",
    });
  };
  
  return (
    <div className="px-4 py-4 border-t border-border relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent/40 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-r opacity-30 pointer-events-none z-0" />
      
      <div className="bg-card rounded-lg p-4 mb-4 shadow-md relative z-10">
        <div
          className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      
      <div className="flex justify-end space-x-2 relative z-10">
        <Button
          variant="outline"
          size="sm"
          className="group relative overflow-hidden"
          onClick={copyContent}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Copy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          <span className="group-hover:underline relative z-10">Copiar</span>
        </Button>
        
        <Button 
          variant="destructive" 
          size="sm"
          className="group relative overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          <span className="group-hover:underline relative z-10">Excluir</span>
        </Button>
      </div>
    </div>
  );
};

export default EmailContent;
