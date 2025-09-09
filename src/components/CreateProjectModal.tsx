import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitBranch, Loader2 } from 'lucide-react';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: { name: string; repository: string; framework: string }) => void;
}

const projectSchema = z.object({
  repository: z.string().url("Debe ser una URL de repositorio válida."),
  name: z.string().min(1, "El nombre del proyecto es requerido."),
  framework: z.string().min(1, "Debes seleccionar un framework."),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const CreateProjectModal = ({ open, onOpenChange, onCreateProject }: CreateProjectModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      repository: '',
      name: '',
      framework: '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onCreateProject(data);
    setIsLoading(false);
    form.reset();
    onOpenChange(false);
  };

  const extractRepoName = (url: string) => {
    try {
      const match = url.match(/\/([^\/]+)\.git$/) || url.match(/\/([^\/]+)\/?$/);
      return match ? match[1] : '';
    } catch {
      return '';
    }
  };

  const repositoryUrl = form.watch('repository');
  useEffect(() => {
    if (repositoryUrl && !form.getValues('name')) {
      form.setValue('name', extractRepoName(repositoryUrl));
    }
  }, [repositoryUrl, form]);

  const frameworks = [
    { value: 'nextjs', label: 'Next.js' },
    { value: 'react', label: 'React' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'static', label: 'HTML/CSS/JS' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo proyecto</DialogTitle>
          <DialogDescription>
            Conecta tu repositorio de GitHub para crear un nuevo proyecto de despliegue.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="repository"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del repositorio</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <GitBranch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="https://github.com/usuario/proyecto.git" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="mi-proyecto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="framework"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Framework detectado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un framework" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.value} value={framework.value}>
                          {framework.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creando...</>
                ) : ( 'Crear proyecto' )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;