import { ExpandMore, KeyboardArrowDown } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/tauri";
import { startCase } from "lodash-es";
import { useState } from "react";

import { useWallets } from "@/store";
import { Wallet, walletTypes } from "@/types/wallets";

import { HDWalletForm } from "./Wallet/HDWallet";
import { ImpersonatorForm } from "./Wallet/Impersonator";
import { JsonKeystore } from "./Wallet/JsonKeystore";
import { Ledger } from "./Wallet/Ledger";
import { Plaintext } from "./Wallet/Plaintext";

export function SettingsWallets() {
  const wallets = useWallets((s) => s.wallets);
  const [newType, setNewType] = useState<Wallet["type"] | null>(null);

  if (!wallets) return null;

  const startNew = (type: Wallet["type"]) => {
    setNewType(type);
  };

  const closeNew = () => setNewType(null);

  return (
    <>
      <Stack>
        {wallets.map((wallet) => (
          <ExistingItem key={wallet.name} wallet={wallet} />
        ))}
        {newType && <NewItem key={`_new`} type={newType} onFinish={closeNew} />}
      </Stack>
      {!newType && (
        <Stack spacing={2} direction="row" sx={{ mt: 4 }}>
          <AddWalletButton onChoice={startNew} />
        </Stack>
      )}
    </>
  );
}

interface ItemProps {
  wallet: Wallet;
}

function ExistingItem({ wallet }: ItemProps) {
  const props = {
    onSubmit: (params: object) =>
      invoke("wallets_update", { name: wallet.name, params }),
    onRemove: () => invoke("wallets_remove", { name: wallet.name }),
  };

  return (
    <Accordion defaultExpanded={!wallet}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack alignItems="center" direction="row">
          <Typography>{wallet.name}</Typography>
          <Chip sx={{ marginLeft: 2 }} label={wallet.type} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {wallet.type === "plaintext" && (
          <Plaintext wallet={wallet} {...props} />
        )}
        {wallet.type === "jsonKeystore" && (
          <JsonKeystore wallet={wallet} {...props} />
        )}
        {wallet.type === "HDWallet" && (
          <HDWalletForm wallet={wallet} {...props} />
        )}
        {wallet.type === "impersonator" && (
          <ImpersonatorForm wallet={wallet} {...props} />
        )}
        {wallet.type === "ledger" && <Ledger wallet={wallet} {...props} />}
      </AccordionDetails>
    </Accordion>
  );
}

interface NewItemProps {
  type: Wallet["type"];
  onFinish: () => void;
}

function NewItem({ type, onFinish }: NewItemProps) {
  const save = async (params: object) => {
    await invoke("wallets_create", { params: { ...params, type } });
  };

  const props = {
    onSubmit: (params: object) => {
      save(params);
      onFinish();
    },
    onRemove: onFinish,
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography sx={{ pb: 2 }}>New {type}</Typography>

      {type === "plaintext" && <Plaintext {...props} />}
      {type === "jsonKeystore" && <JsonKeystore {...props} />}
      {type === "HDWallet" && <HDWalletForm {...props} />}
      {type === "impersonator" && <ImpersonatorForm {...props} />}
      {type === "ledger" && <Ledger {...props} />}
    </Paper>
  );
}

interface AddWalletButtonProps {
  onChoice: (type: Wallet["type"]) => void;
}

const AddWalletButton = ({ onChoice }: AddWalletButtonProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | undefined>();
  const open = Boolean(anchor);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
  };
  const handleClose = () => setAnchor(undefined);
  const handleChoice = (type: Wallet["type"]) => {
    onChoice(type);
    setAnchor(undefined);
  };

  return (
    <>
      <Button
        id="add-wallet-btn"
        aria-controls={open ? "add-wallet-type-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={handleOpen}
        endIcon={<KeyboardArrowDown />}
        color="info"
        size="medium"
      >
        Add wallet
      </Button>
      <Menu
        id="add-wallet-type-menu"
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
      >
        {walletTypes.map((walletType: Wallet["type"]) => (
          <MenuItem
            value={walletType}
            key={walletType}
            sx={{ textTransform: "capitalize" }}
            onClick={() => handleChoice(walletType)}
          >
            {startCase(walletType)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
