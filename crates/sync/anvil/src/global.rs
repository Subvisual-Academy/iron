use std::collections::HashMap;

use iron_broadcast::InternalMsg;
use iron_db::DB;
use iron_types::UIEvent;
use once_cell::sync::{Lazy, OnceCell};
use tokio::sync::{mpsc, Mutex};
use url::Url;

use crate::tracker::Tracker;

static DB: OnceCell<DB> = OnceCell::new();
static WINDOW_SND: OnceCell<mpsc::UnboundedSender<UIEvent>> = OnceCell::new();
static LISTENERS: Lazy<Mutex<HashMap<u32, Tracker>>> = Lazy::new(Default::default);

pub fn init(db: DB, window_snd: mpsc::UnboundedSender<UIEvent>) {
    DB.set(db).unwrap();
    WINDOW_SND.set(window_snd).unwrap();
    tokio::spawn(async { receiver().await });
}

async fn receiver() -> ! {
    let mut rx = iron_broadcast::subscribe().await;

    loop {
        if let Ok(InternalMsg::ResetAnvilListener { chain_id, http, ws }) = rx.recv().await {
            reset_listener(chain_id, http, ws).await
        }
    }
}

async fn reset_listener(chain_id: u32, http: Url, ws: Url) {
    LISTENERS.lock().await.remove(&chain_id);

    let listener = Tracker::run(
        chain_id,
        http,
        ws,
        DB.get().unwrap().clone(),
        WINDOW_SND.get().unwrap().clone(),
    );

    LISTENERS.lock().await.insert(chain_id, listener);
}