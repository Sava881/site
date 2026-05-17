(function(){
  let firebaseReadyResolve;

  const firebaseReady = new Promise(resolve => {
    firebaseReadyResolve = resolve;
  });

  function markFirebaseReady(){
    if(window.CustomerOrdersFirebase){
      firebaseReadyResolve(window.CustomerOrdersFirebase);
    }
  }

  window.addEventListener("CustomerOrdersFirebaseReady", markFirebaseReady);
  markFirebaseReady();

  function normalizeOrderForAdmin(order){
    return {
      ...order,

      source: "customer_app",
      localOrderId: order.id,

      title: order.title || order.service || "Заказ от заказчика",
      service: order.service || order.title || "",
      description: order.description || "",

      city: String(order.city || "").trim(),
      address: order.address || "",
      startAt: order.startAt || "",
      hours: Number(order.hours || 0),
      workersCount: Number(order.workersCount || 1),

      customerName: order.clientName || "",
      customerPhone: order.phone || "",

      status: order.status || "new",
      updatedAt: window.CustomerOrdersFirebase.serverTimestamp(),
      createdAt: order.createdAt || window.CustomerOrdersFirebase.serverTimestamp()
    };
  }

  async function createOrder(order){
    const firebase = await firebaseReady;
    const cleanOrder = normalizeOrderForAdmin(order);

    await firebase.setDoc(
      firebase.doc(firebase.db, "customerOrders", cleanOrder.id),
      cleanOrder
    );

    return cleanOrder;
  }

  async function deleteOrder(orderId){
    const firebase = await firebaseReady;

    await firebase.deleteDoc(
      firebase.doc(firebase.db, "customerOrders", orderId)
    );

    return true;
  }

async function requestCancelOrder(orderId){
  const firebase = await firebaseReady;

  await firebase.updateDoc(
    firebase.doc(firebase.db, "customerOrders", orderId),
    {
      status: "cancel_requested",
      cancelRequested: true,
      cancelRequestedAt: firebase.serverTimestamp()
    }
  );

  return true;
}

  async function listenMyOrders(clientId, callback){
    const firebase = await firebaseReady;

    const q = firebase.query(
      firebase.collection(firebase.db, "customerOrders"),
      firebase.where("clientId", "==", clientId)
    );

    return firebase.onSnapshot(q, snap => {
      const orders = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      callback(orders);
    }, error => {
      console.error("Ошибка realtime заказов:", error);

      if(typeof window.showToast === "function"){
        window.showToast("Ошибка загрузки заказов");
      }
    });
  }

async function listenOrderChat(orderId, callback){
  const firebase = await firebaseReady;

  const q = firebase.query(
    firebase.collection(firebase.db, "customerOrders", orderId, "messages"),
    firebase.orderBy("createdAt", "asc")
  );

  return firebase.onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  });
}

async function sendChatMessage(orderId, text){
  const firebase = await firebaseReady;

  await firebase.addDoc(
    firebase.collection(firebase.db, "customerOrders", orderId, "messages"),
    {
      from: "client",
      text,
      createdAt: firebase.serverTimestamp(),
      deliveredToAdmin: true,
      readByAdmin: false
    }
  );
}

window.CustomerOrdersSync = {
  createOrder,
  deleteOrder,
  listenMyOrders,
  listenOrderChat,
  requestCancelOrder,
  sendChatMessage
};

window.dispatchEvent(new Event("CustomerOrdersSyncReady"));
})();