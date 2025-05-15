
import React, { useState } from 'react';
import { Mail, Search, Download, Send, Trash2, Filter, CheckSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Sample data - would come from database in real app
const sampleSubscribers = [
  {
    id: 1,
    email: 'martina.schmidt@example.com',
    name: 'Martina Schmidt',
    status: 'active',
    source: 'Blog',
    dateSubscribed: '2025-05-01',
    openRate: 68,
    interests: ['Rasenmähen', 'Düngen']
  },
  {
    id: 2,
    email: 'thomas.weber@example.com',
    name: 'Thomas Weber',
    status: 'active',
    source: 'Homepage',
    dateSubscribed: '2025-04-15',
    openRate: 92,
    interests: ['Rasenmähen', 'Bewässerung', 'Unkraut']
  },
  {
    id: 3,
    email: 'sabine.mueller@example.com',
    name: 'Sabine Müller',
    status: 'inactive',
    source: 'Newsletter',
    dateSubscribed: '2025-03-22',
    openRate: 23,
    interests: ['Bewässerung']
  },
  {
    id: 4,
    email: 'patrick.schulz@example.com',
    name: 'Patrick Schulz',
    status: 'active',
    source: 'Free Plan',
    dateSubscribed: '2025-05-10',
    openRate: 100,
    interests: ['Rasenmähen', 'Düngen', 'Bewässerung', 'Unkraut']
  },
  {
    id: 5,
    email: 'julia.becker@example.com',
    name: 'Julia Becker',
    status: 'active',
    source: 'Landing Page',
    dateSubscribed: '2025-04-28',
    openRate: 75,
    interests: ['Düngen', 'Unkraut']
  }
];

const EmailSubscribers = () => {
  const [subscribers, setSubscribers] = useState(sampleSubscribers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);
  
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || subscriber.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });
  
  const sources = Array.from(new Set(subscribers.map(sub => sub.source)));
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubscribers(filteredSubscribers.map(sub => sub.id));
    } else {
      setSelectedSubscribers([]);
    }
  };
  
  const handleSelectSubscriber = (subscriberId: number, checked: boolean) => {
    if (checked) {
      setSelectedSubscribers([...selectedSubscribers, subscriberId]);
    } else {
      setSelectedSubscribers(selectedSubscribers.filter(id => id !== subscriberId));
    }
  };
  
  const handleExportSelected = () => {
    if (selectedSubscribers.length === 0) {
      toast.warning('Bitte wählen Sie mindestens einen Abonnenten aus');
      return;
    }
    
    toast.success(`${selectedSubscribers.length} Abonnenten exportiert`, {
      description: 'Die Daten würden als CSV-Datei heruntergeladen werden'
    });
  };
  
  const handleSendEmail = () => {
    if (selectedSubscribers.length === 0) {
      toast.warning('Bitte wählen Sie mindestens einen Abonnenten aus');
      return;
    }
    
    toast.success(`E-Mail wird an ${selectedSubscribers.length} Abonnenten gesendet`, {
      description: 'In einer vollständigen Implementierung würde ein E-Mail-Editor geöffnet werden'
    });
  };
  
  const handleDeleteSelected = () => {
    if (selectedSubscribers.length === 0) {
      toast.warning('Bitte wählen Sie mindestens einen Abonnenten aus');
      return;
    }
    
    toast.success(`${selectedSubscribers.length} Abonnenten wurden gelöscht`, {
      description: 'Diese Aktion würde normalerweise einen Bestätigungsdialog zeigen'
    });
    
    setSubscribers(subscribers.filter(sub => !selectedSubscribers.includes(sub.id)));
    setSelectedSubscribers([]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <Mail className="h-6 w-6" />
          E-Mail-Abonnenten
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gesamt-Abonnenten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{subscribers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Aktive Abonnenten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {subscribers.filter(sub => sub.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Durchschnittliche Öffnungsrate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {Math.round(subscribers.reduce((sum, sub) => sum + sub.openRate, 0) / subscribers.length)}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Abonnenten suchen..."
            className="pl-9 w-full sm:w-[250px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Quelle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Quellen</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm cursor-pointer select-none">
            Alle auswählen
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSelected}
            disabled={selectedSubscribers.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportieren
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSendEmail}
            disabled={selectedSubscribers.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="mr-2 h-4 w-4" />
            E-Mail senden
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={selectedSubscribers.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quelle</TableHead>
              <TableHead>Abonniert am</TableHead>
              <TableHead>Öffnungsrate</TableHead>
              <TableHead>Interessen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.length > 0 ? (
              filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSubscribers.includes(subscriber.id)}
                      onCheckedChange={(checked) => 
                        handleSelectSubscriber(subscriber.id, checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                      className={subscriber.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                    >
                      {subscriber.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscriber.source}</TableCell>
                  <TableCell>{subscriber.dateSubscribed}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      subscriber.openRate > 75 ? 'border-green-500 text-green-700' :
                      subscriber.openRate > 50 ? 'border-blue-500 text-blue-700' :
                      subscriber.openRate > 25 ? 'border-yellow-500 text-yellow-700' :
                      'border-red-500 text-red-700'
                    }>
                      {subscriber.openRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {subscriber.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Keine Abonnenten gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Zeige {filteredSubscribers.length} von {subscribers.length} Abonnenten
      </div>
    </div>
  );
};

export default EmailSubscribers;
