import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { MessageSquare, Clock, CheckCircle, XCircle, Mail, Send } from 'lucide-react-native';
import { useSupportStore } from '@/stores/support-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminSupportScreen() {
  const { tickets, replyToTicket, closeTicket } = useSupportStore();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleReply = (ticketId: string) => {
    if (!replyMessage.trim()) {
      Alert.alert('Error', 'Please enter a reply message');
      return;
    }

    replyToTicket(ticketId, replyMessage.trim(), true);
    setReplyMessage('');
    setSelectedTicket(null);
    Alert.alert('Success', 'Reply sent to user');
  };

  const handleCloseTicket = (ticketId: string) => {
    Alert.alert(
      'Close Ticket',
      'Are you sure you want to close this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          onPress: () => {
            closeTicket(ticketId);
            setSelectedTicket(null);
            Alert.alert('Success', 'Ticket closed');
          },
        },
      ]
    );
  };

  const handleEmailSupport = () => {
    const email = 'agilewalletcustomerservice@gmail.com';
    const subject = 'Customer Support';
    const body = 'Hello, I need assistance with...';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Could not open email client');
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#F59E0B';
      case 'replied': return '#10B981';
      case 'closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock size={16} color="#F59E0B" />;
      case 'replied': return <CheckCircle size={16} color="#10B981" />;
      case 'closed': return <XCircle size={16} color="#6B7280" />;
      default: return <Clock size={16} color="#6B7280" />;
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open');
  const repliedTickets = tickets.filter(t => t.status === 'replied');
  const closedTickets = tickets.filter(t => t.status === 'closed');

  return (
    <>
      <Stack.Screen options={{ title: 'Support Management' }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Support Tickets</Text>
            <Text style={styles.subtitle}>Manage customer support requests</Text>
          </View>

          <View style={styles.emailCard}>
            <Mail size={24} color="#6366F1" />
            <View style={styles.emailContent}>
              <Text style={styles.emailTitle}>Direct Email Support</Text>
              <Text style={styles.emailAddress}>agilewalletcustomerservice@gmail.com</Text>
            </View>
            <TouchableOpacity style={styles.emailButton} onPress={handleEmailSupport}>
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Clock size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{openTickets.length}</Text>
              <Text style={styles.statLabel}>Open</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.statNumber}>{repliedTickets.length}</Text>
              <Text style={styles.statLabel}>Replied</Text>
            </View>
            <View style={styles.statCard}>
              <XCircle size={24} color="#6B7280" />
              <Text style={styles.statNumber}>{closedTickets.length}</Text>
              <Text style={styles.statLabel}>Closed</Text>
            </View>
          </View>

          {tickets.length > 0 ? (
            <View style={styles.ticketsList}>
              {tickets
                .sort((a, b) => {
                  // Sort by status priority (open first, then replied, then closed)
                  const statusPriority = { open: 0, replied: 1, closed: 2 };
                  const aPriority = statusPriority[a.status as keyof typeof statusPriority];
                  const bPriority = statusPriority[b.status as keyof typeof statusPriority];
                  if (aPriority !== bPriority) return aPriority - bPriority;
                  // Then sort by creation date (newest first)
                  return b.createdAt - a.createdAt;
                })
                .map(ticket => (
                  <View key={ticket.id} style={styles.ticketCard}>
                    <View style={styles.ticketHeader}>
                      <View style={styles.ticketInfo}>
                        <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                        <Text style={styles.ticketUser}>User: {ticket.userId}</Text>
                        <Text style={styles.ticketDate}>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.ticketStatus}>
                        {getStatusIcon(ticket.status)}
                        <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                          {ticket.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.ticketMessage}>{ticket.message}</Text>

                    {ticket.replies.length > 0 && (
                      <View style={styles.repliesSection}>
                        <Text style={styles.repliesTitle}>Conversation:</Text>
                        {ticket.replies.map(reply => (
                          <View key={reply.id} style={[styles.reply, reply.isAdmin ? styles.adminReply : styles.userReply]}>
                            <Text style={styles.replyAuthor}>
                              {reply.isAdmin ? 'Admin' : 'User'}
                            </Text>
                            <Text style={styles.replyMessage}>{reply.message}</Text>
                            <Text style={styles.replyDate}>
                              {new Date(reply.timestamp).toLocaleString()}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {ticket.status !== 'closed' && (
                      <View style={styles.ticketActions}>
                        {selectedTicket === ticket.id ? (
                          <View style={styles.replyForm}>
                            <Input
                              value={replyMessage}
                              onChangeText={setReplyMessage}
                              placeholder="Type your reply..."
                              multiline
                              numberOfLines={3}
                              style={styles.replyInput}
                            />
                            <View style={styles.replyButtons}>
                              <Button
                                title="Cancel"
                                onPress={() => {
                                  setSelectedTicket(null);
                                  setReplyMessage('');
                                }}
                                variant="secondary"
                                size="small"
                                style={styles.replyButton}
                              />
                              <Button
                                title="Send Reply"
                                onPress={() => handleReply(ticket.id)}
                                size="small"
                                style={styles.replyButton}
                              />
                            </View>
                          </View>
                        ) : (
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.replyActionButton]}
                              onPress={() => setSelectedTicket(ticket.id)}
                            >
                              <MessageSquare size={16} color="#FFFFFF" />
                              <Text style={styles.actionButtonText}>Reply</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.closeActionButton]}
                              onPress={() => handleCloseTicket(ticket.id)}
                            >
                              <XCircle size={16} color="#FFFFFF" />
                              <Text style={styles.actionButtonText}>Close</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MessageSquare size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No support tickets</Text>
              <Text style={styles.emptySubtext}>All support requests will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  emailCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  emailContent: {
    flex: 1,
    marginLeft: 16,
  },
  emailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emailAddress: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  emailButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  ticketsList: {
    gap: 16,
    marginBottom: 32,
  },
  ticketCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4B5563',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketUser: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  ticketDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketMessage: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    marginBottom: 16,
  },
  repliesSection: {
    marginBottom: 16,
  },
  repliesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  reply: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  adminReply: {
    backgroundColor: '#1F2937',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  userReply: {
    backgroundColor: '#1F2937',
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  replyMessage: {
    fontSize: 13,
    color: '#E5E7EB',
    lineHeight: 18,
    marginBottom: 4,
  },
  replyDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  ticketActions: {
    marginTop: 16,
  },
  replyForm: {
    gap: 12,
  },
  replyInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  replyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  replyButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    minHeight: Platform.OS === 'android' ? 44 : 40,
  },
  replyActionButton: {
    backgroundColor: '#6366F1',
  },
  closeActionButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
    marginBottom: 32,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});