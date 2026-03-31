import {
  LayoutDashboard,
  Megaphone,
  BookOpen,
  Sparkles,
  HandHeart,
  Cross,
  Church,
  ShieldQuestion,
  Users,
  Link2,
  HeartHandshake,
  Compass,
  Calendar,
  Flag,
  Ticket,
  GraduationCap,
  Award,
  DollarSign,
  Star,
  Trophy,
  Gift,
  MessageSquare,
  FileText,
  ClipboardList,
  BookOpenCheck,
  Video,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  section: string;
}

export const navigation: NavItem[] = [
  // Principal
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, section: 'Principal' },
  { name: 'Avisos', href: '/avisos', icon: Megaphone, section: 'Principal' },
  // Fé e Oração
  { name: 'Liturgia', href: '/liturgia', icon: BookOpen, section: 'Fé e Oração' },
  { name: 'Meditações', href: '/meditacoes', icon: Sparkles, section: 'Fé e Oração' },
  { name: 'Orações', href: '/oracoes', icon: HandHeart, section: 'Fé e Oração' },
  { name: 'Novenas', href: '/novenas', icon: Cross, section: 'Fé e Oração' },
  // Sacramentos
  { name: 'Missas', href: '/missas', icon: Church, section: 'Sacramentos' },
  { name: 'Confissões', href: '/confissoes', icon: ShieldQuestion, section: 'Sacramentos' },
  // Comunidade
  { name: 'Comunidade', href: '/comunidade', icon: Users, section: 'Comunidade' },
  { name: 'Conexões', href: '/conexoes', icon: Link2, section: 'Comunidade' },
  { name: 'Pastorais', href: '/pastorais', icon: HeartHandshake, section: 'Comunidade' },
  { name: 'Direção Espiritual', href: '/direcao-espiritual', icon: Compass, section: 'Comunidade' },
  // Eventos
  { name: 'Eventos', href: '/eventos', icon: Calendar, section: 'Eventos' },
  { name: 'Campanhas', href: '/campanhas', icon: Flag, section: 'Eventos' },
  { name: 'Sorteios', href: '/sorteios', icon: Ticket, section: 'Eventos' },
  // Formação
  { name: 'Cursos', href: '/cursos', icon: GraduationCap, section: 'Formação' },
  { name: 'Certificados', href: '/certificados', icon: Award, section: 'Formação' },
  // Financeiro
  { name: 'Dízimos', href: '/dizimos', icon: DollarSign, section: 'Financeiro' },
  // Gamificação
  { name: 'Gamificação', href: '/gamificacao', icon: Star, section: 'Gamificação' },
  { name: 'Ranking', href: '/gamificacao/ranking', icon: Trophy, section: 'Gamificação' },
  { name: 'Prêmios', href: '/gamificacao/premios', icon: Gift, section: 'Gamificação' },
  // Outros
  { name: 'Mensagens', href: '/mensagens', icon: MessageSquare, section: 'Outros' },
  { name: 'Documentos', href: '/documentos', icon: FileText, section: 'Outros' },
  { name: 'Escalas', href: '/escalas', icon: ClipboardList, section: 'Outros' },
  { name: 'Catequese', href: '/catequese', icon: BookOpenCheck, section: 'Outros' },
  { name: 'Vídeos', href: '/videos', icon: Video, section: 'Outros' },
];

export const sectionLabels: Record<string, string> = {
  'Principal': 'Principal',
  'Fé e Oração': 'Fé e Oração',
  'Sacramentos': 'Sacramentos',
  'Comunidade': 'Comunidade',
  'Eventos': 'Eventos',
  'Formação': 'Formação',
  'Financeiro': 'Financeiro',
  'Gamificação': 'Gamificação',
  'Outros': 'Outros',
};
