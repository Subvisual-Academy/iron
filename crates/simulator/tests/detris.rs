use std::str::FromStr;

use ethers::types::{Bytes, Log};
use iron_simulator::{Evm, Request};
use iron_types::{Address, ToEthers, B256};
use pretty_assertions::assert_eq;

#[tokio::test(flavor = "multi_thread")]
async fn simulate_detris() {
    let fork_url = "https://ethereum.publicnode.com".to_string();
    let fork_block_number = Some(17579630);

    let tx = Request {
        from: Address::from_str("0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503").unwrap(),
        to: Address::from_str("0xf0f8628d496782d6a9c724f047d14b4fc2569ea1").unwrap(),
        value: None,
        data: Some(Bytes::from_str("0x1249c58b").unwrap()),
        gas_limit: 0,
    };

    let mut evm = Evm::new(fork_url, fork_block_number, u64::MAX).await;

    let res = evm.call(tx).await.unwrap();

    assert!(res.success);
    assert_eq!(res.gas_used, 118246);
    assert_eq!(res.logs.len(), 1);
    assert_eq!(
        res.logs[0],
        Log {
            address: Address::from_str("0xbdc105c068715d57860702da9fa0c5ead11fba51")
                .unwrap()
                .to_ethers(),
            topics: vec![
                B256::from_str(
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                )
                .unwrap()
                .to_ethers(),
                B256::from_str(
                    "0x0000000000000000000000000000000000000000000000000000000000000000"
                )
                .unwrap()
                .to_ethers(),
                B256::from_str(
                    "0x00000000000000000000000047ac0fb4f2d84898e4d9e7b4dab3c24507a6d503"
                )
                .unwrap()
                .to_ethers(),
                B256::from_str(
                    "0x0000000000000000000000000000000000000000000000000000000000000022"
                )
                .unwrap()
                .to_ethers()
            ],
            data: Bytes::from_str("0x").unwrap(),
            ..Default::default()
        }
    );
}
