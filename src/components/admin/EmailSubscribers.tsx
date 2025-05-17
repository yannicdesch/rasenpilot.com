
import React, { useState } from 'react';
import { Mail, Search, Download, Send, Trash2, Filter, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useSubscribers } from '@/hooks/useSubscribers';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const EmailSubscribers = () => {
  const { 
    subscribers, 
    isLoading, 
    error, 
    refreshSubscribers,
    deleteMultipleSubscribers
  } = useSubscribers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
  
  const handleSelectSubscriber = (subscriberId: string, checked: boolean) => {
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
    
    const selectedData = subscribers.filter(sub => selectedSubscribers.includes(sub.id));
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + 'Email,Name,Status,Quelle,Abonniert am,Öffnungsrate,Interessen\n'
      + selectedData.map(sub => 
          `${sub.email},${sub.name || ''},${sub.status},${sub.source},${sub.dateSubscribed},${sub.openRate}%,"${sub.interests.join(', ')}"`
        ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${selectedSubscribers.length} Abonnenten exportiert`);
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
    
    deleteMultipleSubscribers(selectedSubscribers);
    setSelectedSubscribers([]);
  };
  
  const formatDate = (dateString: string) => {
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
          <Mail className="h-6 w-6" />
          E-Mail-Abonnenten
        </h2>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={refreshSubscribers}
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Aktualisieren</span>
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      
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
              {subscribers.length > 0 
                ? Math.round(subscribers.reduce((sum, sub) => sum + sub.openRate, 0) / subscribers.length) 
                : 0}%
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Abonnenten werden geladen...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubscribers.length > 0 ? (
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
                  <TableCell>{subscriber.name || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                      className={subscriber.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                    >
                      {subscriber.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscriber.source}</TableCell>
                  <TableCell>{formatDate(subscriber.dateSubscribed)}</TableCell>
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
                      {subscriber.interests.length > 0 ? subscriber.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      )) : (
                        <span className="text-gray-400 text-xs">Keine</span>
                      )}
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
