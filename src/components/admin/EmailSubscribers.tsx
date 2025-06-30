
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Edit, Trash2, Mail, MoreHorizontal, Download, Upload } from 'lucide-react';
import useSubscribers, { Subscriber } from '@/hooks/useSubscribers';
import { toast } from 'sonner';

const EmailSubscribers = () => {
  const { subscribers, isLoading, addSubscriber, updateSubscriber, deleteSubscriber } = useSubscribers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    name: '',
    status: 'active' as 'active' | 'inactive',
    source: 'Manual',
    interests: [] as string[]
  });

  // Filter subscribers
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) {
      toast.error('E-Mail-Adresse ist erforderlich');
      return;
    }

    try {
      await addSubscriber(newSubscriber);
      setNewSubscriber({
        email: '',
        name: '',
        status: 'active',
        source: 'Manual',
        interests: []
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding subscriber:', error);
    }
  };

  const handleEditSubscriber = async () => {
    if (!editingSubscriber) return;

    try {
      await updateSubscriber(editingSubscriber.id, editingSubscriber);
      setEditingSubscriber(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating subscriber:', error);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm('Sind Sie sicher, dass Sie diesen Abonnenten löschen möchten?')) {
      try {
        await deleteSubscriber(id);
      } catch (error) {
        console.error('Error deleting subscriber:', error);
      }
    }
  };

  const openEditDialog = (subscriber: Subscriber) => {
    setEditingSubscriber({ ...subscriber });
    setIsEditDialogOpen(true);
  };

  const exportSubscribers = () => {
    const csvContent = [
      ['E-Mail', 'Name', 'Status', 'Quelle', 'Datum', 'Öffnungsrate'].join(','),
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.status,
        sub.source,
        new Date(sub.dateSubscribed).toLocaleDateString('de-DE'),
        `${sub.openRate}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'subscribers.csv';
    link.click();
  };

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    inactive: subscribers.filter(s => s.status === 'inactive').length,
    avgOpenRate: subscribers.length > 0 
      ? Math.round(subscribers.reduce((sum, s) => sum + s.openRate, 0) / subscribers.length)
      : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">E-Mail Abonnenten</h1>
        <div className="flex gap-2">
          <Button onClick={exportSubscribers} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Abonnent hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Abonnenten hinzufügen</DialogTitle>
                <DialogDescription>
                  Fügen Sie einen neuen E-Mail-Abonnenten hinzu
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSubscriber.email}
                    onChange={(e) => setNewSubscriber(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newSubscriber.name}
                    onChange={(e) => setNewSubscriber(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Vollständiger Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newSubscriber.status} 
                    onValueChange={(value: 'active' | 'inactive') => 
                      setNewSubscriber(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="inactive">Inaktiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Quelle</Label>
                  <Input
                    id="source"
                    value={newSubscriber.source}
                    onChange={(e) => setNewSubscriber(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="z.B. Website, Newsletter, etc."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleAddSubscriber}>
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Abonnenten</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Abonnenten</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inaktive Abonnenten</CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Öffnungsrate</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgOpenRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach E-Mail oder Name suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnenten ({filteredSubscribers.length})</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre E-Mail-Abonnenten
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Lade Abonnenten...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Keine Abonnenten gefunden</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quelle</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Öffnungsrate</TableHead>
                  <TableHead className="w-[100px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      {subscriber.email}
                    </TableCell>
                    <TableCell>{subscriber.name || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                      >
                        {subscriber.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell>{subscriber.source}</TableCell>
                    <TableCell>
                      {new Date(subscriber.dateSubscribed).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>{subscriber.openRate}%</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(subscriber)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSubscriber(subscriber.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abonnent bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Abonnentendaten
            </DialogDescription>
          </DialogHeader>
          {editingSubscriber && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-Mail-Adresse</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingSubscriber.email}
                  onChange={(e) => setEditingSubscriber(prev => 
                    prev ? { ...prev, email: e.target.value } : null
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingSubscriber.name || ''}
                  onChange={(e) => setEditingSubscriber(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingSubscriber.status} 
                  onValueChange={(value: 'active' | 'inactive') => 
                    setEditingSubscriber(prev => 
                      prev ? { ...prev, status: value } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleEditSubscriber}>
                  Speichern
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSubscribers;
