
import React, { useState } from 'react';
import { Users, Search, MoreHorizontal, Mail, Edit, Trash2 } from 'lucide-react';
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

// Sample data - in a real app this would come from your database
const sampleUsers = [
  { 
    id: 1, 
    name: 'Max Mustermann', 
    email: 'max@example.com', 
    status: 'active', 
    role: 'user',
    registerDate: '2025-04-12',
    lastActive: '2025-05-14'
  },
  { 
    id: 2, 
    name: 'Lisa Schmidt', 
    email: 'lisa@example.com', 
    status: 'active', 
    role: 'admin',
    registerDate: '2025-03-28',
    lastActive: '2025-05-15'
  },
  { 
    id: 3, 
    name: 'Thomas Weber', 
    email: 'thomas@example.com', 
    status: 'inactive', 
    role: 'user',
    registerDate: '2025-01-05',
    lastActive: '2025-03-22'
  },
  { 
    id: 4, 
    name: 'Julia Meyer', 
    email: 'julia@example.com', 
    status: 'active', 
    role: 'user',
    registerDate: '2025-05-01',
    lastActive: '2025-05-10'
  },
  { 
    id: 5, 
    name: 'Stefan Becker', 
    email: 'stefan@example.com', 
    status: 'active', 
    role: 'user',
    registerDate: '2025-02-18',
    lastActive: '2025-05-13'
  }
];

const UserManagement = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSendEmail = (userId: number) => {
    const user = users.find(u => u.id === userId);
    toast.success(`E-Mail an ${user?.name} wird vorbereitet...`);
    // In a real app, this would open an email composition form
  };
  
  const handleEditUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    toast.info(`Benutzer ${user?.name} wird bearbeitet...`);
    // In a real app, this would open a user edit form
  };
  
  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    // Here we just update the state for demo purposes
    toast.success(`Benutzer ${user?.name} wurde gelöscht`, {
      description: "Diese Aktion würde normalerweise einen Bestätigungsdialog zeigen"
    });
    setUsers(users.filter(user => user.id !== userId));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Benutzerverwaltung
        </h2>
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
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
                  <TableCell>{user.registerDate}</TableCell>
                  <TableCell>{user.lastActive}</TableCell>
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
