import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dancepass/events/event.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:geoflutterfire2/geoflutterfire2.dart';

class EventService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final geo = GeoFlutterFire();

  static const String usersCollection = 'users';
  static const String eventsCollection = 'events';

  Future<String> createDraftEvent() async {
    final String? uid = _auth.currentUser?.uid;
    if (uid == null) {
      throw Exception('User is not authenticated.');
    }
    DocumentReference eventRef = _firestore.collection(usersCollection).doc(uid).collection(eventsCollection).doc();
    await eventRef.set({
      'id': eventRef.id,
      'creatorId': uid,
      'isPublished': false,
      'createdAt': FieldValue.serverTimestamp(),
    });
    return eventRef.id;
  }

  Future<void> saveEvent(Event event) async {
    if (event.id.isEmpty) {
      throw Exception('Event ID is empty, cannot save to Firestore.');
    }
    final String? uid = _auth.currentUser?.uid;
    if (uid == null) {
      throw Exception('User is not authenticated.');
    }
    DocumentReference eventRef = _firestore.collection(usersCollection).doc(uid).collection(eventsCollection).doc(event.id);
    Map<String, dynamic> eventData = event.toFirestore();
    await eventRef.set(eventData, SetOptions(merge: true));
  }

  Stream<Event> getEventStream(String eventId) {
    final String? uid = _auth.currentUser?.uid;
    if (uid == null) {
      throw Exception('User is not authenticated.');
    }
    DocumentReference eventRef = _firestore.collection(usersCollection).doc(uid).collection(eventsCollection).doc(eventId);
    return eventRef.snapshots().map((snapshot) {
      if (snapshot.exists && snapshot.data() != null) {
        return Event.fromFirestore(snapshot.data()! as Map<String, dynamic>);
      } else {
        return Event(id: eventId, geoPoint: GeoFirePoint(0, 0));
      }
    });
  }

  Stream<List<Event>> getEventsNearUser(GeoFirePoint center, double radius) {
    final collectionRef = _firestore.collection(eventsCollection);
    return geo.collection(collectionRef: collectionRef)
      .within(center: center, radius: radius, field: 'location.geopoint')
      .map((docs) => docs.map((doc) => Event.fromFirestore(doc.data() as Map<String, dynamic>)).toList());
  }

  Future<void> publishEvent(Event event) async {
    event.isPublished = true;
    await saveEvent(event);
  }

  Future<List<Event>> fetchEvents() async {
    final querySnapshot = await _firestore.collection(eventsCollection).get();
    return querySnapshot.docs.map((doc) => Event.fromFirestore(doc.data())).toList();
  }

  Future<List<Event>> fetchBigEvents() async {
    final querySnapshot = await _firestore.collection(eventsCollection).where('type', isEqualTo: 'BigEvent').get();
    return querySnapshot.docs.map((doc) => Event.fromFirestore(doc.data())).toList();
  }
}
