import { supabase } from './supabase';
import { Friendship, Profile, FriendshipStatus } from './types';

export async function sendFriendRequest(addresseeId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .or(`requester_id.eq.${addresseeId},addressee_id.eq.${addresseeId}`)
    .single();

  if (existing) {
    return false;
  }

  const { error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: 'pending',
    });

  if (error) {
    console.error('Error sending friend request:', error);
    return false;
  }

  return true;
}

export async function acceptFriendRequest(friendshipId: string): Promise<boolean> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId);

  if (error) {
    console.error('Error accepting friend request:', error);
    return false;
  }

  return true;
}

export async function rejectFriendRequest(friendshipId: string): Promise<boolean> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'rejected' })
    .eq('id', friendshipId);

  if (error) {
    console.error('Error rejecting friend request:', error);
    return false;
  }

  return true;
}

export async function removeFriend(friendshipId: string): Promise<boolean> {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) {
    console.error('Error removing friend:', error);
    return false;
  }

  return true;
}

export async function getFriendships(): Promise<(Friendship & { friend: Profile })[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(*),
      addressee:profiles!friendships_addressee_id_fkey(*)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  if (error) {
    console.error('Error fetching friendships:', error);
    return [];
  }

  return (data || []).map((f) => ({
    ...f,
    friend: f.requester_id === user.id ? f.addressee : f.requester,
  })) as (Friendship & { friend: Profile })[];
}

export async function getPendingRequests(): Promise<(Friendship & { requester: Profile })[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(*)
    `)
    .eq('addressee_id', user.id)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }

  return data || [];
}

export async function getFriendshipStatus(userId: string): Promise<{ status: FriendshipStatus; friendshipId: string } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('friendships')
    .select('id, status')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
    .single();

  if (!data) return null;
  return { status: data.status, friendshipId: data.id };
}

export async function searchPlayers(query: string): Promise<Profile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('display_name', `%${query}%`)
    .neq('id', user.id)
    .limit(20);

  if (error) {
    console.error('Error searching players:', error);
    return [];
  }

  return data || [];
}

export async function shareMatch(matchId: string): Promise<string | null> {
  // In a real app, this would generate a deep link
  // For now, return a placeholder URL
  return `https://weplaybasketball.app/match/${matchId}`;
}
