(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBGB7AK-fqfTPdNUa_h9IQtdkyCOaQkcBc",
    authDomain: "flutter-ai-playground-6264a.firebaseapp.com",
    projectId: "flutter-ai-playground-6264a"
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const old = document.querySelector(`script[src="${src}"]`);
      if (old) {
        old.addEventListener("load", resolve);
        old.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function initCustomerFirebase() {
    try {
      await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js");

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      const db = firebase.firestore();

      function collection(dbRef, path, docId, subPath) {
        if (path && docId && subPath) {
          return dbRef.collection(path).doc(docId).collection(subPath);
        }

        return dbRef.collection(path);
      }

      function doc(dbRef, path, docId) {
        return dbRef.collection(path).doc(docId);
      }

function setDoc(ref, data) {
  return ref.set(data);
}

function deleteDoc(ref) {
  return ref.delete();
}

function updateDoc(ref, data) {
  return ref.update(data);
}  

      function addDoc(ref, data) {
        return ref.add(data);
      }

      function onSnapshot(ref, callback, errorCallback) {
        return ref.onSnapshot(callback, errorCallback);
      }

      function where(field, operator, value) {
        return {
          type: "where",
          field,
          operator,
          value
        };
      }

      function orderBy(field, direction) {
        return {
          type: "orderBy",
          field,
          direction: direction || "asc"
        };
      }

      function query(baseRef, ...rules) {
        let ref = baseRef;

        rules.forEach(rule => {
          if (!rule) return;

          if (rule.type === "where") {
            ref = ref.where(rule.field, rule.operator, rule.value);
          }

          if (rule.type === "orderBy") {
            ref = ref.orderBy(rule.field, rule.direction);
          }
        });

        return ref;
      }

      function serverTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
      }

      window.CustomerOrdersFirebase = {
        db,
        collection,
        doc,
        setDoc,
        deleteDoc,
        onSnapshot,
        updateDoc,
        query,
        where,
        orderBy,
        addDoc,
        serverTimestamp
      };

      window.dispatchEvent(new Event("CustomerOrdersFirebaseReady"));
    } catch (error) {
      console.error("Ошибка подключения Firebase:", error);

      if (typeof window.showToast === "function") {
        window.showToast("Firebase не загрузился. Проверьте интернет.");
      }
    }
  }

  initCustomerFirebase();
})();