import { useEffect, useState } from 'react';
import { Search, Mail, MailOpen, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type ApiMessage = Omit<Message, 'id'> & { _id: string };
const normalize = (item: ApiMessage): Message => ({ ...item, id: item._id });

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<Message | null>(null);

  useEffect(() => {
    apiFetch<ApiMessage[]>('/admin/messages', { auth: true }).then((data) => setMessages(data.map(normalize))).catch(() => setMessages([]));
  }, []);

  const filtered = messages.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase()),
  );

  const markRead = async (id: string) => {
    const updated = await apiFetch<ApiMessage>(`/admin/messages/${id}/read`, { method: 'PATCH', auth: true });
    setMessages(messages.map((m) => (m.id === id ? normalize(updated) : m)));
  };

  return (
    <div className="space-y-6">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." className="pl-10 bg-transparent border-champagne/20" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-champagne/10 text-left">
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Status</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">From</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Subject</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Date</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((msg) => (
              <tr key={msg.id} className={`border-b border-champagne/5 hover:bg-champagne/5 transition-colors ${!msg.read ? 'bg-olive/5' : ''}`}>
                <td className="px-6 py-4">{!msg.read ? <Mail className="w-4 h-4 text-olive-light" /> : <MailOpen className="w-4 h-4 text-muted-warm" />}</td>
                <td className="px-6 py-4"><p className="text-champagne text-sm">{msg.name}</p><p className="text-muted-warm text-xs">{msg.email}</p></td>
                <td className="px-6 py-4 text-champagne text-sm">{msg.subject}</td>
                <td className="px-6 py-4 text-muted-warm text-sm font-mono">{new Date(msg.createdAt).toISOString().slice(0, 10)}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => { if (!msg.read) markRead(msg.id); setViewing(msg); }} className="text-muted-warm hover:text-champagne transition-colors"><Eye className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="glass border-champagne/20 max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-xl text-champagne tracking-wider">Message</DialogTitle></DialogHeader>
          {viewing && (<div className="space-y-4 mt-4"><div><span className="text-muted-warm text-xs uppercase">From</span><p className="text-champagne">{viewing.name} ({viewing.email})</p></div><div><span className="text-muted-warm text-xs uppercase">Subject</span><p className="text-champagne">{viewing.subject}</p></div><div><span className="text-muted-warm text-xs uppercase">Message</span><p className="text-muted-warm text-sm mt-1 leading-relaxed">{viewing.message}</p></div></div>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
