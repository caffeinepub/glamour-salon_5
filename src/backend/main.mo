import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  // === Types ===

  // Service Catalog
  public type ServiceCategory = {
    #trending;
    #seasonal;
    #popular;
    #classic;
  };

  module ServiceCategory {
    public func compare(cat1 : ServiceCategory, cat2 : ServiceCategory) : Order.Order {
      switch (cat1, cat2) {
        case (#trending, #trending) { #equal };
        case (#trending, _) { #less };
        case (_, #trending) { #greater };
        case (#seasonal, #seasonal) { #equal };
        case (#seasonal, _) { #less };
        case (_, #seasonal) { #greater };
        case (#popular, #popular) { #equal };
        case (#popular, _) { #less };
        case (_, #popular) { #greater };
        case (#classic, #classic) { #equal };
      };
    };
  };

  public type SalonService = {
    name : Text;
    description : Text;
    price : Nat;
    durationMinutes : Nat;
    category : ServiceCategory;
  };

  public type StylistProfile = {
    name : Text;
    bio : Text;
    specialties : [Text];
    experienceYears : Nat;
    rating : Float;
    beforeAfterPhotos : [Storage.ExternalBlob];
  };

  public type InventoryItem = {
    name : Text;
    quantity : Nat;
    threshold : Nat;
    category : Text;
  };

  public type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
    #completed;
  };

  public type Booking = {
    customer : Principal;
    serviceId : Text;
    stylistId : Text;
    timestamp : Time.Time;
    status : BookingStatus;
    advancePayment : Nat;
  };

  module SalonService {
    public func compare(s1 : SalonService, s2 : SalonService) : Order.Order {
      Text.compare(s1.name, s2.name);
    };
  };

  module StylistProfile {
    public func compare(s1 : StylistProfile, s2 : StylistProfile) : Order.Order {
      Text.compare(s1.name, s2.name);
    };
  };

  module InventoryItem {
    public func compare(i1 : InventoryItem, i2 : InventoryItem) : Order.Order {
      Text.compare(i1.name, i2.name);
    };
  };

  module Booking {
    public func compare(b1 : Booking, b2 : Booking) : Order.Order {
      Int.compare(b1.timestamp, b2.timestamp);
    };
  };

  // === State ===

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stripe
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Services / Stylists / Inventory / Bookings
  let services = Map.empty<Text, SalonService>();
  let stylists = Map.empty<Text, StylistProfile>();
  let inventory = Map.empty<Text, InventoryItem>();
  let bookings = Map.empty<Text, Booking>();

  // === Service Management ===

  public shared ({ caller }) func addService(service : SalonService) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add services");
    };
    services.add(service.name, service);
  };

  public shared ({ caller }) func updateService(service : SalonService) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update services");
    };
    services.add(service.name, service);
  };

  public shared ({ caller }) func deleteService(serviceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete services");
    };
    services.remove(serviceId);
  };

  public query ({ caller }) func getService(serviceId : Text) : async ?SalonService {
    services.get(serviceId);
  };

  public query ({ caller }) func getServices() : async [SalonService] {
    services.values().toArray().sort();
  };

  // === Stylist Management ===

  public shared ({ caller }) func addStylist(stylist : StylistProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add stylists");
    };
    stylists.add(stylist.name, stylist);
  };

  public shared ({ caller }) func updateStylist(stylist : StylistProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update stylists");
    };
    stylists.add(stylist.name, stylist);
  };

  public shared ({ caller }) func deleteStylist(stylistId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete stylists");
    };
    stylists.remove(stylistId);
  };

  public query ({ caller }) func getStylist(stylistId : Text) : async ?StylistProfile {
    stylists.get(stylistId);
  };

  public query ({ caller }) func getStylists() : async [StylistProfile] {
    stylists.values().toArray().sort();
  };

  // === Inventory Management ===

  public shared ({ caller }) func addInventoryItem(item : InventoryItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add inventory");
    };
    inventory.add(item.name, item);
  };

  public shared ({ caller }) func updateInventoryItem(item : InventoryItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update inventory");
    };
    inventory.add(item.name, item);
  };

  public shared ({ caller }) func deleteInventoryItem(itemId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete inventory");
    };
    inventory.remove(itemId);
  };

  public query ({ caller }) func getInventoryItems() : async [InventoryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view inventory");
    };
    inventory.values().toArray().sort();
  };

  public query ({ caller }) func getLowStockItems() : async [InventoryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view inventory");
    };
    inventory.values().toArray().filter(func(i) { i.quantity <= i.threshold }).sort();
  };

  // === Booking Management ===

  public shared ({ caller }) func createBooking(serviceId : Text, stylistId : Text, timestamp : Time.Time, advancePayment : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only customers can book appointments");
    };

    let booking : Booking = {
      customer = caller;
      serviceId;
      stylistId;
      timestamp;
      status = #pending;
      advancePayment;
    };

    bookings.add(serviceId # stylistId # timestamp.toText(), booking);
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Text, status : BookingStatus) : async () {
    let booking = switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    if (booking.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only booking owner or admin can update status");
    };

    let updatedBooking = {
      customer = booking.customer;
      serviceId = booking.serviceId;
      stylistId = booking.stylistId;
      timestamp = booking.timestamp;
      status;
      advancePayment = booking.advancePayment;
    };

    bookings.add(bookingId, updatedBooking);
  };

  public query ({ caller }) func getCustomerBookings(customer : Principal) : async [Booking] {
    if (caller != customer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };

    bookings.values().toArray().filter(func(b) { b.customer == customer }).sort();
  };

  public query ({ caller }) func getBookingsByStatus(status : BookingStatus) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view bookings by status");
    };
    bookings.values().toArray().filter(func(b) { b.status == status }).sort();
  };

  public query ({ caller }) func getBookingsByStylist(stylistId : Text) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view bookings by stylist");
    };
    bookings.values().toArray().filter(func(b) { b.stylistId == stylistId }).sort();
  };

  public query ({ caller }) func getBooking(bookingId : Text) : async Booking {
    let booking = switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    if (booking.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };

    booking;
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all bookings");
    };
    bookings.values().toArray().sort();
  };

  // === Earning Reports ===

  public query ({ caller }) func getDailyEarnings() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view earnings");
    };

    let now = Time.now();
    let startOfDay = now - (now % (24 * 60 * 60 * 1_000_000_000));

    var total = 0;
    bookings.values().toArray().forEach(func(b) {
      if (b.status == #completed and b.timestamp >= startOfDay) {
        total += b.advancePayment * 10;
      };
    });
    total;
  };

  public query ({ caller }) func getEarningsByCategory() : async [(ServiceCategory, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view earnings");
    };

    let now = Time.now();
    let startOfDay = now - (now % (24 * 60 * 60 * 1_000_000_000));

    let categoryMap = Map.empty<ServiceCategory, Nat>();

    bookings.values().toArray().forEach(func(b) {
      if (b.status == #completed and b.timestamp >= startOfDay) {
        switch (services.get(b.serviceId)) {
          case (null) {};
          case (?s) {
            let current = switch (categoryMap.get(s.category)) {
              case (null) { 0 };
              case (?amount) { amount };
            };
            categoryMap.add(s.category, current + b.advancePayment * 10);
          };
        };
      };
    });

    categoryMap.toArray();
  };

  // === Stripe Payments ===

  public query ({ caller }) func isStripeConfigured() : async Bool {
    not (stripeConfig == null);
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
