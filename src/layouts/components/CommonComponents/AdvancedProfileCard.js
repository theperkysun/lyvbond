import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from '../../../utlis/comon';
import AstroPopup from '../../screens/Astro Pop up/AstroPopup';
import { userProfileData } from './profileUserData';

const { width, height } = Dimensions.get('window');

export default function AdvancedProfileCard({
  card = {},
  onPress,
  showConnectButton = true,
  showOnlineStatus = true
}) {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [astroPopupVisible, setAstroPopupVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryRef = useRef(null);

  const {
    id,
    userId,
    images = [],
    url,
    name = 'Unknown',
    age = '',
    height: userHeight = '',
    religion = '',
    work = '',
    location = '',
    lookingFor = '',
    astro = '',
    online = false,
    isVip = false,
    photosCount = (images?.length || (url ? 1 : 0)),
    vipBadge,
    normalBadge,
  } = card || {};

  const galleryImages =
    Array.isArray(images) && images.length > 0 ? images : url ? [url] : [];

  const openGallery = (startIndex = 0) => {
    setGalleryIndex(startIndex);
    setGalleryVisible(true);
    setTimeout(() => {
      if (galleryRef.current) {
        galleryRef.current.scrollToIndex({ index: startIndex, animated: false });
      }
    }, 0);
  };

  const renderGalleryItem = ({ item }) => (
    <View style={styles.galleryImageWrapper}>
      <Image source={item} style={styles.galleryImage} />
    </View>
  );

  return (
    <>
      <TouchableOpacity activeOpacity={100} style={styles.cardWrapper} onPress={onPress}>

        {/* MAIN IMAGE */}
        {galleryImages.length > 0 ? (
          <Image source={galleryImages[0]} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.emptyImage]}>
            <Icon name="person" size={72} color="#fff" />
          </View>
        )}

        {/* PROMOTED */}
        <View style={styles.promotedWrapper}>
          <Icon name="info" size={14} color="#fff" />
          <Text style={styles.promotedText}>Promoted</Text>
        </View>

        {/* TOP RIGHT SECTION — VIP or CROWN + Photo Count */}
        <View style={styles.topRight}>

          {/* Show VIP badge OR small crown */}
          {isVip
            ? vipBadge && <Image source={vipBadge} style={styles.vipBadge} />
            : normalBadge && <Image source={normalBadge} style={styles.nonVipBadge} />
          }

          {/* CAMERA BUTTON */}
          <TouchableOpacity
            style={styles.photoCountBtn}
            onPress={() => openGallery(0)}
            activeOpacity={0.85}
          >
            <Icon name="photo-camera" size={16} color="#fff" />
            <Text style={styles.photoText}>{photosCount}</Text>
          </TouchableOpacity>
        </View>

        {/* MENU */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setMenuVisible(true)}
        >
          <Icon name="more-vert" size={22} color="#fff" />
        </TouchableOpacity>

        {/* BOTTOM INFO CONTENT */}
        <View style={styles.bottomSection}>
          <Text style={styles.name}>
            {name}
            {age ? `, ${age}` : ''}
          </Text>

          <View style={styles.line} />

          {/* Height • Religion • Work */}
          <View style={styles.inlineRow}>
            {userHeight ? <Text style={styles.info}>{userHeight}</Text> : null}
            {religion ? <Text style={styles.dot}>●</Text> : null}
            {religion ? <Text style={styles.info}>{religion}</Text> : null}
            {work ? <Text style={styles.dot}>●</Text> : null}
            {work ? <Text style={styles.info}>{work}</Text> : null}
          </View>

          {location ? <Text style={styles.location}>{location}</Text> : null}

          <View style={styles.tagRow}>
            {showOnlineStatus && (
              <TouchableOpacity
                style={styles.tag}
                onPress={() =>
                  navigation.navigate("ChatView", {
                    chatId: userId ?? id,
                    name: name,
                    image: images?.[0] ?? url,
                    online: online,
                  })
                }
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: online ? 'green' : 'gray' },
                  ]}
                />
                <Text style={styles.tagText}>{online ? 'Online' : 'Offline'}</Text>
              </TouchableOpacity>
            )}

            {lookingFor ? (
              <View style={styles.tag}>
                <Ionicons name="heart" size={18} color={COLORS.primary} />
                <Text style={styles.tagText}>{lookingFor}</Text>
              </View>
            ) : null}

            {astro ? (
              <TouchableOpacity
                style={styles.tag}
                onPress={() => setAstroPopupVisible(true)}
              >
                <Ionicons name="planet" size={18} color="#FFEA00" />
                <Text style={styles.tagText}>stro</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.line} />

          {/* CONNECT SECTION */}
          {showConnectButton && (
            <View style={styles.connectRow}>
              <Text style={styles.connectText}>Like this Profile?</Text>

              <TouchableOpacity
                style={styles.connectClickable}
                activeOpacity={0.85}
                onPress={() => console.log("Connect Now pressed")}
              >
                <Text style={styles.connectAction}>Connect Now</Text>
                <View style={styles.smallTick}>
                  <Icon name="check" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* MENU MODAL */}
      <Modal visible={menuVisible} transparent animationType="slide">
        <Pressable style={styles.modalBg} onPress={() => setMenuVisible(false)} />
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.sheetItem}><Text style={styles.sheetText}>Share</Text></TouchableOpacity>
          <TouchableOpacity style={styles.sheetItem}><Text style={styles.sheetText}>Add to Shortlist</Text></TouchableOpacity>
          <TouchableOpacity style={styles.sheetItem}><Text style={styles.sheetText}>Block this Profile</Text></TouchableOpacity>
          <TouchableOpacity style={styles.sheetItem}><Text style={styles.sheetText}>Report this Profile</Text></TouchableOpacity>
        </View>
      </Modal>

      {/* GALLERY MODAL */}
      <Modal visible={galleryVisible} transparent animationType="slide">
        <SafeAreaView style={styles.galleryModalWrapper}>
          <View style={styles.galleryTopBar}>
            <TouchableOpacity onPress={() => setGalleryVisible(false)} style={styles.galleryClose}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.galleryCounter}>{galleryIndex + 1} / {galleryImages.length}</Text>
            <View style={{ width: 46 }} />
          </View>

          <FlatList
            ref={galleryRef}
            data={galleryImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            getItemLayout={(_, i) => ({ length: width, offset: i * width, index: i })}
            onMomentumScrollEnd={(ev) => {
              const idx = Math.round(ev.nativeEvent.contentOffset.x / width);
              setGalleryIndex(idx);
            }}
            renderItem={renderGalleryItem}
          />
        </SafeAreaView>
      </Modal>


      <AstroPopup
        visible={astroPopupVisible}
        onClose={() => setAstroPopupVisible(false)}
        currentUser={userProfileData}
        partnerUser={card}
      />
    </>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  cardWrapper: {
    width: width - 20,
    height: height * 0.80,
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    marginVertical: 0,
  },

  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  emptyImage: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },

  promotedWrapper: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  promotedText: { color: '#fff', marginLeft: 6 },

  topRight: {
    position: 'absolute',
    top: 14,
    right: 14,
    alignItems: 'flex-end',
  },

  /* VIP large, Crown small */
  vipBadge: { width: 60, height: 60, resizeMode: 'contain' },
  nonVipBadge: { width: 34, height: 34, resizeMode: 'contain' },

  photoCountBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  photoText: { color: '#fff', marginLeft: 6 },

  menuBtn: {
    position: 'absolute',
    top: 120,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 8,
    borderRadius: 20,
  },

  bottomSection: {
    position: 'absolute',
    bottom: 18,
    left: 14,
    right: 14,
  },

  name: { color: '#fff', fontSize: 22, fontWeight: '700' },

  line: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: 10,
  },

  inlineRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },

  dot: { color: '#fff', marginHorizontal: 8 },

  info: { color: '#fff', fontSize: 13 },

  location: { color: '#fff', marginTop: 8, fontSize: 14 },

  tagRow: { flexDirection: 'row', marginTop: 10 },

  tag: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 8,
  },

  tagText: { color: '#fff', marginLeft: 6 },

  statusDot: { width: 8, height: 8, borderRadius: 10 },

  connectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  connectText: { color: '#cbd5e1', fontSize: 14 },

  connectClickable: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectAction: {
    color: '#2cc6ff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },

  smallTick: {
    width: 26,
    height: 26,
    borderRadius: 26,
    backgroundColor: '#2cc6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },

  sheet: {
    backgroundColor: '#fff',
    paddingBottom: 34,
    paddingTop: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  sheetItem: { padding: 16 },
  sheetText: { fontSize: 16 },

  galleryModalWrapper: { flex: 1, backgroundColor: '#000' },

  galleryTopBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  galleryClose: { padding: 8 },

  galleryCounter: { color: '#fff', fontSize: 16 },

  galleryImageWrapper: { width, height: height - 56 },

  galleryImage: {
    width,
    height: height - 56,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
});
