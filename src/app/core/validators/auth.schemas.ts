import { z } from 'zod';

export const LoginSchema = z.object({
  correo: z.string().min(1, 'El correo es obligatorio').email('Formato de correo inválido'),
  contrasena: z.string().min(1, 'La contraseña es obligatoria')
});

export type LoginData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  correo: z.string().min(1, 'El correo es obligatorio').email('Formato de correo inválido'),
  contrasena: z.string()
    .min(1, 'La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  nombres: z.string().min(1, 'El nombre es obligatorio'),
  apepa: z.string().min(1, 'El apellido paterno es obligatorio'),
  apema: z.string().min(1, 'El apellido materno es obligatorio')
});

export type RegisterData = z.infer<typeof RegisterSchema>;
