
import React, { useState } from 'react';
import { Users, Search, MoreHorizontal, Mail, Edit, Trash2, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useUsers, User } from '@/hooks/useUsers';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const UserManagement = () => {
  const { users, isLoading, error, refreshUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSendEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    toast.success(`E-Mail an ${user?.name || user?.email} wird vorbereitet...`);
    // In a real app, this would open an email composition form
  };
  
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    toast.info(`Benutzer ${user?.name || user?.email} wird bearbeitet...`);
    // In a real app, this would open a user edit form
  };
  
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    // Here we just update the state for demo purposes
    toast.success(`Benutzer ${user?.name || user?.email} wurde gelöscht`, {
      description: "Diese Aktion würde normalerweise einen Bestätigungsdialog zeigen"
    });
    // In a real app, we would call an API to delete the user
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Benutzerverwaltung
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshUsers}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Aktualisieren</span>
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Benutzer suchen..."
              className="pl-9 w-[250px]"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gesamtbenutzer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Aktive Benutzer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {users.filter(user => user.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Administratoren</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {users.filter(user => user.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Registriert am</TableHead>
              <TableHead>Letzte Aktivität</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Benutzer werden geladen...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || '(Kein Name)'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className={user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                    >
                      {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={user.role === 'admin' ? 'border-blue-500 text-blue-500' : ''}>
                      {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menü öffnen</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSendEmail(user.id)}>
                          <Mail className="mr-2 h-4 w-4" />
                          E-Mail senden
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Keine Benutzer gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
