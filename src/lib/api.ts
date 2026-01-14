import axios from 'axios';

// Base API URL - conecta ao backend Node.js
const API_BASE_URL = 'http://127.0.0.1:3002'; // Forçando IP local para evitar problemas de resolução e ENV

// Instância axios configurada
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ============================================
// FLOWS API
// ============================================

export interface FlowNode {
    type: 'message' | 'question' | 'handover' | 'disqualify';
    content: string;
    options?: Array<{
        id: string;
        label: string;
        value?: string;
        next_node: string;
        save_as?: string;
        description?: string;
    }>;
    next_node?: string;
    save_as?: string;
    tags?: string[];
    title?: string;
    footer?: string;
}

export interface Flow {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    trigger_keyword?: string;
    nodes: Record<string, FlowNode>;
    created_at: string;
    updated_at: string;
}

/**
 * Lista todos os fluxos
 */
export async function getFlows(): Promise<Flow[]> {
    const response = await api.get('/api/flows');
    return response.data.data;
}

/**
 * Obtém um fluxo por ID
 */
export async function getFlow(id: string): Promise<Flow> {
    const response = await api.get(`/api/flows/${id}`);
    return response.data.data;
}

/**
 * Salva um fluxo (atualiza)
 */
export async function saveFlow(id: string, data: { nodes?: Record<string, unknown>; name?: string; description?: string; is_active?: boolean }): Promise<Flow> {
    const response = await api.put(`/api/flows/${id}`, data);
    return response.data.data;
}


/**
 * Cria um novo fluxo
 */
export async function createFlow(data: Partial<Flow>): Promise<Flow> {
    const response = await api.post('/api/flows', data);
    return response.data.data;
}

/**
 * Remove um fluxo
 */
export async function deleteFlow(id: string): Promise<void> {
    await api.delete(`/api/flows/${id}`);
}

/**
 * Ativa um fluxo
 */
export async function activateFlow(id: string): Promise<Flow> {
    const response = await api.post(`/api/flows/${id}/activate`);
    return response.data.data;
}

// ============================================
// CONTACTS API
// ============================================

export interface Contact {
    phone: string;
    name?: string;
    current_flow_id?: string;
    current_node_id?: string;
    status: 'BOT' | 'PENDING' | 'FINISHED' | 'DISQUALIFIED' | 'HUMAN';
    variables: Record<string, string>;
    tags: string[];
    last_interaction_at: string;
    created_at: string;
    updated_at: string;
}

/**
 * Lista contatos com filtro de status
 */
export async function getContacts(status?: string): Promise<Contact[]> {
    const params = status ? { status } : {};
    const response = await api.get('/api/contacts', { params });
    return response.data.data;
}

/**
 * Obtém um contato por telefone
 */
export async function getContact(phone: string): Promise<Contact> {
    const response = await api.get(`/api/contacts/${phone}`);
    return response.data.data;
}

/**
 * Atualiza um contato
 */
export async function updateContact(phone: string, data: Partial<Contact>): Promise<Contact> {
    const response = await api.put(`/api/contacts/${phone}`, data);
    return response.data.data;
}
/**
 * Reativa o bot para um contato
 */
export async function reactivateContact(phone: string): Promise<Contact> {
    const response = await api.post(`/api/contacts/${phone}/reactivate`);
    return response.data.data;
}
// ============================================
// MESSAGES API
// ============================================

export interface Message {
    id: string;
    contact_phone: string;
    direction: 'in' | 'out';
    content: string;
    message_type: 'text' | 'button' | 'list' | 'image' | 'audio' | 'document' | 'location';
    node_id?: string;
    created_at: string;
}

/**
 * Lista mensagens de um contato
 */
export async function getMessages(phone: string): Promise<Message[]> {
    const response = await api.get(`/api/contacts/${phone}/messages`);
    return response.data.data;
}
// ============================================
// NOTIFICATIONS API
// ============================================

export interface NotificationSetting {
    id: string;
    name: string;
    phone: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export async function getNotificationSettings(): Promise<NotificationSetting[]> {
    const response = await api.get('/api/notifications');
    return response.data;
}

export async function createNotificationSetting(data: { name: string; phone: string }): Promise<NotificationSetting> {
    const response = await api.post('/api/notifications', data);
    return response.data;
}

export async function deleteNotificationSetting(id: string): Promise<void> {
    await api.delete(`/api/notifications/${id}`);
}
/**
 * Envia mensagem para um contato
 */
export async function sendMessage(phone: string, message: string): Promise<void> {
    await api.post(`/api/contacts/${phone}/messages`, { message });
}

// ============================================
// WEBHOOK / STATUS API
// ============================================

/**
 * Verifica status da API
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get('/health');
    return response.data;
}

export default api;
