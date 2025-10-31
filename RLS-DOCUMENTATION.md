# 🔐 Documentación de Políticas RLS (Row Level Security)

## 📋 Resumen Ejecutivo

Este documento detalla las políticas de seguridad a nivel de fila (RLS) implementadas en la base de datos PostgreSQL para garantizar que los usuarios solo accedan a datos autorizados según su rol.

## 🎯 Arquitectura de Seguridad

### Roles del Sistema
- **`anon`**: Usuario no autenticado (acceso limitado)
- **`authenticated`**: Usuario autenticado (cliente)
- **`admin`**: Administrador (acceso completo)

### Principios de Seguridad
1. **Mínimo Privilegio**: Usuarios solo acceden a lo necesario
2. **Separación por Rol**: Diferenciación clara entre cliente/admin
3. **Propiedad de Datos**: Usuarios son dueños de sus datos
4. **Acceso Público Controlado**: Datos públicos explícitamente definidos

## 📊 Tabla de Políticas RLS

### 1. Tabla `profiles`
**Propósito**: Información extendida de usuarios vinculada a auth.users

| Política | Tipo | Condición | Descripción |
|----------|------|-----------|-------------|
| `profiles_select_self_or_admin` | SELECT | `auth.uid() = id OR auth.jwt() ->> 'role' = 'admin'` | Usuarios ven solo su perfil, admin ve todos |
| `profiles_update_self` | UPDATE | `auth.uid() = id` | Usuarios solo actualizan su propio perfil |
| `profiles_insert_self` | INSERT | `auth.uid() = id` | Usuarios solo insertan su propio perfil |

**SQL Completo:**
```sql
-- SELECT: Usuario ve su perfil o admin ve todos
CREATE POLICY "profiles_select_self_or_admin" ON profiles 
FOR SELECT USING (
  auth.uid() = id OR auth.jwt() ->> 'role' = 'admin'
);

-- UPDATE: Usuario actualiza solo su perfil
CREATE POLICY "profiles_update_self" ON profiles 
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- INSERT: Usuario crea solo su perfil
CREATE POLICY "profiles_insert_self" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);