import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import { createClient } from '@supabase/supabase-js';

type ScreenKey = 'home' | 'news' | 'trending' | 'about';

type MenuItem = {
  key: ScreenKey;
  label: string;
};

const menuItems: MenuItem[] = [
  { key: 'home', label: 'Home' },
  { key: 'news', label: 'Newsfeed' },
  { key: 'trending', label: 'Trending' },
  { key: 'about', label: 'About' },
];

const heroText = {
  title: 'Making humans critical thinkers again.',
  subtitle:
    'Scan any video from Instagram, YouTube or TikTok - we fact-check every claim across hundreds of sources and give you only the truth.',
};

const websiteApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'web' ? 'http://localhost:3000' : 'http://192.168.0.131:3000');

const supabase = createClient(
  'https://zmnecxlcwxyiqyoobzxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbmVjeGxjd3h5aXF5b29ienh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzQzNzUsImV4cCI6MjA5ODY1MDM3NX0.7VOeQg8sIm83zejP1PQ_Bp13BLbCaMG2tlCV0Rj4bzY'
);

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('home');
  const [menuVisible, setMenuVisible] = useState(false);
  const [link, setLink] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [supabaseItems, setSupabaseItems] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [websiteArticles, setWebsiteArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`${websiteApiBaseUrl}/api/articles`);
        if (response.ok) {
          const payload = await response.json();
          const articles = Array.isArray(payload?.articles) ? payload.articles : [];
          setWebsiteArticles(articles);
          const mapped = articles.slice(0, 6).map((article: any) => ({
            title: article.title || 'Fact-checked story',
            body: article.centerSummary || article.leftSummary || article.rightSummary || 'Real analysis from the website data layer.',
            badge: article.featured ? 'FEATURED' : 'SITE FEED',
            image: null,
          }));
          setNewsItems(mapped);
          setIsLoadingArticles(false);
          return;
        }
      } catch (err) {
        console.log('website articles load failed', err);
      }

      try {
        const { data, error } = await supabase.from('instagram_cache').select('*').order('view_count', { ascending: false }).limit(6);
        if (!error && data) {
          setSupabaseItems(data);
          const mapped = data.map((item: any) => ({
            title: item.data?.headline || item.topic || 'Fact-checked story',
            body: item.data?.fight || item.data?.reality || 'Real analysis from the website data layer.',
            badge: item.category || 'LIVE',
            image: item.thumbnail || item.data?.imageUrl || null,
          }));
          setNewsItems(mapped);
        }
      } catch (err) {
        console.log('supabase load failed', err);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    loadContent();
  }, []);

  const homeFeedItems = useMemo(() => {
    if (websiteArticles.length) {
      return websiteArticles.slice(0, 3).map((article: any) => ({
        id: article.id,
        title: article.title,
        body: article.centerSummary || article.leftSummary || article.rightSummary,
        badge: article.featured ? 'FEATURED' : 'LIVE',
      }));
    }

    return newsItems.slice(0, 3);
  }, [websiteArticles, newsItems]);

  const trendingItems = useMemo(() => {
    const source = websiteArticles.length ? websiteArticles : supabaseItems;
    return source.slice(0, 3).map((item: any) => ({
      title: item.title || item.data?.headline || item.topic || 'Trending insight',
      tag: item.featured ? 'Featured on the website' : item.category || item.data?.category || 'Trending now',
      image: item.image || item.thumbnail || item.data?.imageUrl || null,
    }));
  }, [websiteArticles, supabaseItems]);

  const handleScan = () => {
    if (!link.trim()) return;
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1400);
  };

  const openScreen = (screen: ScreenKey) => {
    setActiveScreen(screen);
    setMenuVisible(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'news':
        return (
          <View style={styles.panelCard}>
            <Text style={styles.panelTitle}>Newsfeed</Text>
            <Text style={styles.panelBody}>The mobile app now mirrors the website’s news experience directly, with the same editorial tone and section-based layout.</Text>
            <View style={styles.stackList}>
              {newsItems.map((item) => (
                <View key={item.title} style={styles.listItem}>
                  {item.image ? <Image source={{ uri: item.image }} style={styles.storyImage} /> : null}
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{item.title}</Text>
                    <Text style={styles.badge}>{item.badge}</Text>
                  </View>
                  <Text style={styles.listBody}>{item.body}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 'trending':
        return (
          <View style={styles.panelCard}>
            <Text style={styles.panelTitle}>Trending Bias Audits</Text>
            <Text style={styles.panelBody}>These are the viral stories receiving the highest attention and fact-check activity.</Text>
            <View style={styles.stackList}>
              {trendingItems.map((item) => (
                <View key={item.title} style={styles.listItem}>
                  {item.image ? <Image source={{ uri: item.image }} style={styles.storyImage} /> : null}
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listBody}>{item.tag}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 'about':
        return (
          <View style={styles.panelCard}>
            <Text style={styles.panelTitle}>About Only The Truth</Text>
            <Text style={styles.panelBody}>Only The Truth exists to help people slow down, question what they see, and verify claims before they share them. The app is designed to preserve the same experience and tone as the website while being easier to use on a phone.</Text>
          </View>
        );
      case 'home':
      default:
        return (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>{heroText.title}</Text>
              <Text style={styles.heroSubtitle}>{heroText.subtitle}</Text>
              <View style={styles.scannerPill}>
                <TextInput
                  value={link}
                  onChangeText={setLink}
                  placeholder="Paste any video link to fact-check"
                  placeholderTextColor="rgba(255,255,255,0.48)"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={handleScan}
                  style={({ pressed }) => [styles.scanButton, pressed && styles.scanButtonPressed]}
                >
                  <Text style={styles.scanButtonText}>{isScanning ? 'Scanning...' : 'Fact Check'}</Text>
                </Pressable>
              </View>
              <Text style={styles.counterText}>✦ 2,400 scans verified ✦</Text>
            </View>
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>Website-backed stories</Text>
              <Text style={styles.panelBody}>This view is now wired to the same article feed the website uses, so the phone experience stays aligned with the live content layer.</Text>
              {isLoadingArticles ? (
                <Text style={styles.panelBody}>Syncing with the website feed…</Text>
              ) : null}
              <View style={styles.stackList}>
                {homeFeedItems.map((item) => (
                  <View key={item.id || item.title} style={styles.listItem}>
                    <View style={styles.listHeader}>
                      <Text style={styles.listTitle}>{item.title}</Text>
                      <Text style={styles.badge}>{item.badge || 'LIVE'}</Text>
                    </View>
                    <Text style={styles.listBody}>{item.body}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={['#141212', '#1b1a1a', '#141212']} style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => setMenuVisible(true)} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Menu</Text>
          </Pressable>
          <Text style={styles.brandText}>Only The Truth</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoArea}>
            <Text style={styles.logoSubtitle}>Only the truth</Text>
            <Text style={styles.logoTitle}>ONLY THE TRUTH</Text>
          </View>

          {renderScreen()}
        </ScrollView>
      </LinearGradient>

      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Menu</Text>
            {menuItems.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => openScreen(item.key)}
                style={[styles.modalItem, activeScreen === item.key && styles.modalItemActive]}
              >
                <Text style={[styles.modalItemText, activeScreen === item.key && styles.modalItemTextActive]}>{item.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setMenuVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#141212',
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  menuButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  brandText: {
    color: '#f5f5f5',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  topBarSpacer: {
    width: 54,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  logoArea: {
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: 'center',
  },
  logoSubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    fontStyle: 'italic',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  logoTitle: {
    color: '#f5f5f5',
    fontFamily: 'PlayfairDisplay_900Black',
    fontSize: 34,
    letterSpacing: -0.6,
    lineHeight: 36,
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 20,
    marginTop: 6,
  },
  heroTitle: {
    color: '#f5f5f5',
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  scannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    paddingVertical: 8,
  },
  scanButton: {
    backgroundColor: '#ffda44',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  scanButtonPressed: {
    opacity: 0.9,
  },
  scanButtonText: {
    color: '#111',
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  counterText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  panelCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
  },
  panelTitle: {
    color: '#f5f5f5',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginBottom: 6,
  },
  panelBody: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  stackList: {
    gap: 10,
    marginTop: 12,
  },
  listItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listTitle: {
    color: '#f5f5f5',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  badge: {
    color: '#ffda44',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  listBody: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1b1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    color: '#f5f5f5',
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalItemActive: {
    backgroundColor: 'rgba(255,218,68,0.16)',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  modalItemText: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  modalItemTextActive: {
    color: '#ffda44',
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  closeButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
});
