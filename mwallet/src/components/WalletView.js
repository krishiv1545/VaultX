import React, { useEffect, useState, useCallback } from "react";
import {
  Tooltip,
  List,
  Avatar,
  Spin,
  Tabs,
  Button,
  Modal,
  Input,
  message,
  Select,
} from "antd";
import { LogoutOutlined, SettingOutlined, CopyOutlined, QrcodeOutlined, ArrowRightOutlined, DollarOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../noImg.png";
import { makeApiRequest, API_BASE_URL } from "../utils/api";
import { CHAINS_CONFIG } from "../chains";
import "../styles/WalletView.css";
const { ethers } = require("ethers");

// Custom styles
const styles = {
  container: {
    width: '100%',
    maxWidth: '380px',
    height: 'calc(100vh - 40px)',
    background: '#1A1B1F',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    background: 'rgba(26, 27, 31, 0.9)',
    backdropFilter: 'blur(20px)',
    position: 'sticky',
    top: 0,
    zIndex: 2
  },
  accountBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '6px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.08)',
    }
  },
  accountIcon: {
    background: 'linear-gradient(135deg, #5865F2 0%, #7B83EB 100%)',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
  },
  innerContent: {
    padding: '16px 12px',
    position: 'relative',
    zIndex: 2
  },
  balanceSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  balanceChange: {
    color: '#5865F2',
    fontSize: '14px',
    fontWeight: '500',
  },
  accountInfo: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
  },
  balance: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  positiveChange: {
    color: '#00ff9d',
    fontSize: '14px',
    marginLeft: '8px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  actionButton: {
    flex: 1,
    background: 'rgba(88, 101, 242, 0.1)',
    border: 'none',
    borderRadius: '10px',
    padding: '8px',
    color: '#5865F2',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(88, 101, 242, 0.15)',
    }
  },
  tokenList: {
    background: 'transparent',
  },
  tokenItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    marginBottom: '8px',
    padding: '12px',
    border: 'none',
  },
  nftGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
    padding: '12px',
  },
  nftCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
    },
  },
};

// Add these new modal styles after the existing styles object
const modalStyles = {
  modal: {
    background: '#141414',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(20, 20, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  modalContent: {
    padding: '24px',
    background: '#141414',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    padding: '12px 16px',
    width: '100%',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '&:focus': {
      border: '1px solid #5865F2',
      boxShadow: '0 0 0 2px rgba(88, 101, 242, 0.2)',
    }
  },
  button: {
    width: '100%',
    height: '48px',
    background: 'linear-gradient(135deg, #5865F2 0%, #7B83EB 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, #4752C4 0%, #5865F2 100%)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      background: '#2C2F36',
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  addressBox: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
  },
  addressText: {
    color: '#fff',
    fontSize: '15px',
    wordBreak: 'break-all',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  copyButton: {
    background: 'transparent',
    border: 'none',
    color: '#5865F2',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(88, 101, 242, 0.1)',
    }
  },
  qrContainer: {
    background: '#fff',
    padding: '32px',
    borderRadius: '16px',
    width: 'fit-content',
    margin: '32px auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    display: 'block',
  },
  select: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    '& .ant-select-selector': {
      background: 'transparent !important',
      border: 'none !important',
      color: '#fff !important',
    },
    '& .ant-select-arrow': {
      color: 'rgba(255, 255, 255, 0.5)',
    }
  },
  tokenOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
  },
  tokenIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
  },
};

function WalletView({
  wallet,
  setWallet,
  seedPhrase,
  setSeedPhrase,
  selectedChain,
}) {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([
    {
      token_address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      name: "Ethereum",
      symbol: "ETH", 
      logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      balance: "0.01",
      decimals: "18",
      price_change_24h: -0.29,
      usd_price: 18.58
    },
    {
      token_address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      name: "Polygon",
      symbol: "MATIC",
      logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png", 
      balance: "0.00",
      decimals: "18",
      price_change_24h: 0,
      usd_price: 0.00
    },
    {
      token_address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
      name: "Solana", 
      symbol: "SOL",
      logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      balance: "0.00",
      decimals: "18",
      price_change_24h: 0,
      usd_price: 0.00
    },
    {
      token_address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      name: "Wrapped Bitcoin",
      symbol: "WBTC",
      logo: "https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png",
      balance: "0.00",
      decimals: "8",
      price_change_24h: 0.15,
      usd_price: 42000.00
    },
    {
      token_address: "0x514910771af9ca656af840dff83e8264ecf986ca",
      name: "Chainlink",
      symbol: "LINK",
      logo: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
      balance: "0.00",
      decimals: "18",
      price_change_24h: 1.25,
      usd_price: 14.50
    }
  ]);
  const [nfts, setNfts] = useState([
    {
      id: "1",
      name: "Bored Ape #7238", 
      collection: "Bored Ape Yacht Club",
      image: "https://miro.medium.com/v2/resize:fit:1066/1*KPsITt8mUz9hPtkSUCmgVg.jpeg",
      floor_price: "18.5 ETH"
    },
    {
      id: "2",
      name: "Azuki #4623",
      collection: "Azuki", 
      image: "https://th.bing.com/th/id/OIP.nC3Oq0_fXAjJBIdVKdAmHgHaHa?rs=1&pid=ImgDetMain",
      floor_price: "12.2 ETH"
    },
    {
      id: "3",
      name: "Doodle #8748",
      collection: "Doodles",
      image: "https://i.seadn.io/gcs/files/f1273e4d0d141ed4f0c6242a32ad9a32.png",
      floor_price: "3.8 ETH"
    },
    {
      id: "4",
      name: "Pudgy Penguin #2156",
      collection: "Pudgy Penguins",
      image: "https://nftevening.com/wp-content/uploads/2022/08/unnamed-1-4.png",
      floor_price: "6.1 ETH"
    }
  ]);
  const [balance, setBalance] = useState(0);
  const [tokenTransfers, setTokenTransfers] = useState([
    {
      token_symbol: "ETH",
      transaction_type: "Sent",
      usd_value: "180.50",
      block_timestamp: "2024-02-15T10:30:00",
      from_address: "0x1234567890abcdef1234567890abcdef1ayq41637",
      token_logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    },
    {
      token_symbol: "MATIC",
      transaction_type: "Received", 
      usd_value: "50.20",
      block_timestamp: "2024-02-14T15:45:00",
      from_address: "0xabcdef1234567890abcdef1234567890abawdf12",
      token_logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png"
    },
    {
      token_symbol: "SOL",
      transaction_type: "Sent",
      usd_value: "95.30",
      block_timestamp: "2024-02-13T09:15:00", 
      from_address: "0x7890abcdef1234567890abcdef1234567281baew",
      token_logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png"
    },
    {
      token_symbol: "WBTC",
      transaction_type: "Received",
      usd_value: "420.75",
      block_timestamp: "2024-02-12T14:20:00",
      from_address: "0x2468ace135790bdf246801234567890cdafbe13",
      token_logo: "https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png"
    },
    {
      token_symbol: "LINK",
      transaction_type: "Sent",
      usd_value: "145.80",
      block_timestamp: "2024-02-11T11:25:00",
      from_address: "0x13579bdf2468ace13579bdf2468ace13acd4680",
      token_logo: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png"
    },
    {
      token_symbol: "ETH",
      transaction_type: "Received",
      usd_value: "275.60",
      block_timestamp: "2024-02-10T16:50:00",
      from_address: "0xfedcba9876543210fedcba9876543210dcba432",
      token_logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    }
  ]);
  const [nftTransfers, setNftTransfers] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [amountToSend, setAmountToSend] = useState("");
  const [sendToAddress, setSendToAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);

  const items = [
    {
      key: "1",
      label: `Assets`,
      children: (
        <div style={{ padding: '10px' }}>
          <div>
            <div style={styles.actionButtons}>
              <Button 
                type="primary" 
                style={styles.actionButton}
                onClick={() => setDepositModalVisible(true)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ color: '#fff' }}>Deposit</span>
                </div>
              </Button>
              <Button 
                type="primary" 
                style={styles.actionButton}
                onClick={() => setBuyModalVisible(true)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ color: '#fff' }}>Buy</span>
                </div>
              </Button>
              <Button 
                type="primary" 
                style={styles.actionButton}
                onClick={() => setSendModalVisible(true)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ color: '#fff' }}>Send</span>
                </div>
              </Button>
            </div>
          </div>
          
          {tokens && tokens.length > 0 ? (
            <List
              className="tokenList"
              itemLayout="horizontal"
              dataSource={tokens}
              renderItem={(item) => (
                <List.Item style={{
                  background: 'rgba(22, 24, 29, 0.9)',
                  borderRadius: '10px',
                  marginBottom: '6px',
                  padding: '10px 12px',
                  border: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(22, 24, 29, 1)',
                  }
                }}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.logo || logo} size={36} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
                            {item.symbol}
                          </span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                            {Number(item.balance).toFixed(2)} {item.symbol}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
                            ${item.usd_price.toFixed(2)}
                          </div>
                          <div style={{ 
                            color: item.price_change_24h > 0 ? '#00ff9d' : item.price_change_24h < 0 ? '#ff4d4f' : '#808080',
                            fontSize: '14px'
                          }}>
                            {item.price_change_24h > 0 ? '+' : ''}{item.price_change_24h.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: 'rgba(255, 255, 255, 0.6)' }}>
              No tokens found
            </div>
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: `NFTs`,
      children: (
        <div style={styles.nftGrid}>
          {nfts && nfts.length > 0 ? (
            nfts.map((nft, index) => (
              <div key={index} style={styles.nftCard}>
                <img
                  src={nft.image}
                  alt={nft.name}
                  style={{ width: "100%", height: "auto", borderRadius: "12px 12px 0 0" }}
                  loading="lazy"
                />
                <div style={{ padding: '12px' }}>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                    {nft.name}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginTop: '4px' }}>
                    {nft.collection}
                  </div>
                  <div style={{ 
                    color: '#7A73FF', 
                    fontSize: '12px', 
                    marginTop: '8px',
                    background: 'rgba(122, 115, 255, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}>
                    Floor: {nft.floor_price}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: 'rgba(255, 255, 255, 0.6)' }}>
              No NFTs found
            </div>
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: `Activity`,
      children: (
        <div style={{ padding: '10px' }}>
          <List
            dataSource={[...tokenTransfers, ...nftTransfers].sort((a, b) => 
              new Date(b.block_timestamp) - new Date(a.block_timestamp)
            )}
            renderItem={(transfer) => (
              <List.Item style={styles.tokenItem}>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      src={transfer.token_logo || transfer.image_url}
                      style={{ 
                        background: !transfer.token_logo && !transfer.image_url ? 
                          'rgba(122, 115, 255, 0.2)' : 'transparent',
                        color: '#7A73FF' 
                      }}
                    >
                      {!transfer.token_logo && !transfer.image_url && 
                        (transfer.token_symbol ? transfer.token_symbol[0] : 'N')}
                    </Avatar>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#fff' }}>
                        {transfer.token_symbol ? 
                          `${transfer.token_symbol} ${transfer.transaction_type}` : 
                          `${transfer.collection_name} ${transfer.transaction_type}`
                        }
                      </span>
                      <span style={{ 
                        color: transfer.transaction_type === 'Received' ? '#00ff9d' : '#ff4d4f',
                        fontSize: '14px'
                      }}>
                        {transfer.usd_value ? `$${transfer.usd_value}` : ''}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {new Date(transfer.block_timestamp).toLocaleString()} • {transfer.from_address.slice(0, 6)}...{transfer.from_address.slice(-4)}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ];

  const getAccountTokens = useCallback(async () => {
    setFetching(true);
    try {
      console.log("Fetching account tokens...");
      const response = await makeApiRequest(`${API_BASE_URL}/getTokens`, {
        params: {
          userAddress: wallet,
          chain: selectedChain,
        },
      });
      console.log("Received response:", response);

      if (response.tokens) setTokens(response.tokens);
      if (response.nfts) setNfts(response.nfts);
      if (response.balance) setBalance(Number(response.balance));
      if (response.tokenTransfers) setTokenTransfers(response.tokenTransfers);
      if (response.nftTransfers) setNftTransfers(response.nftTransfers);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setFetching(false);
    }
  }, [wallet, selectedChain]);

  async function sendTransaction(to, amount) {
    if (!to || !amount) {
      alert("Please enter both address and amount");
      return;
    }

    const chain = CHAINS_CONFIG[selectedChain];
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
    const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey;
    const wallet = new ethers.Wallet(privateKey, provider);

    const tx = {
      to: to,
      value: ethers.utils.parseEther(amount.toString()),
    };

    setProcessing(true);
    try {
      const transaction = await wallet.sendTransaction(tx);
      setHash(transaction.hash);
      const receipt = await transaction.wait();

      setHash(null);
      setProcessing(false);
      setAmountToSend("");
      setSendToAddress("");

      if (receipt.status === 1) {
        getAccountTokens();
      } else {
        console.log("Transaction failed");
      }
    } catch (err) {
      console.error("Transaction error:", err);
      setHash(null);
      setProcessing(false);
      setAmountToSend("");
      setSendToAddress("");
    }
  }

  function logout() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts([]);
    setTokens([]);
    setBalance(0);
    navigate("/");
  }

  useEffect(() => {
    if (wallet) {
      getAccountTokens();
    }
  }, [getAccountTokens, selectedChain, wallet]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet);
    message.success('Address copied to clipboard');
  };

  const handleSend = async () => {
    if (!recipientAddress || !amount || !selectedToken) {
      message.error('Please fill in all fields');
      return;
    }

    try {
      await sendTransaction(recipientAddress, amount);
      message.success('Transaction sent successfully');
      setSendModalVisible(false);
      setRecipientAddress("");
      setAmount("");
      setSelectedToken(null);
    } catch (error) {
      message.error('Transaction failed');
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.accountBadge}>
          <div style={styles.accountIcon}>
            A1
          </div>
          <div>
            <div style={{ fontWeight: '500' }}>Account 1</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
              {wallet.slice(0, 4)}...{wallet.slice(-4)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <SettingOutlined style={{ fontSize: '20px', cursor: 'pointer', opacity: 0.6 }} />
          <LogoutOutlined style={{ fontSize: '20px', cursor: 'pointer', opacity: 0.6 }} onClick={logout} />
        </div>
      </div>

      <div style={styles.content}>
        {fetching ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : (
          <div style={styles.innerContent}>
            <div style={styles.balanceSection}>
              <div style={styles.balanceAmount}>$10.0</div>
              <div style={styles.balanceChange}>+120%</div>
            </div>
            <Tabs 
              defaultActiveKey="1" 
              items={items} 
              className="walletView"
              style={{
                color: '#fff',
                '& .ant-tabs-tab': {
                  color: 'rgba(255, 255, 255, 0.6) !important',
                  padding: '0 16px 12px 16px',
                },
                '& .ant-tabs-tab-active': {
                  color: '#fff !important',
                },
                '& .ant-tabs-ink-bar': {
                  background: '#5865F2 !important',
                },
                '& .ant-tabs-content': {
                  padding: '0',
                }
              }}
            />
          </div>
        )}
      </div>

      <Modal
        visible={depositModalVisible}
        onCancel={() => setDepositModalVisible(false)}
        footer={null}
        centered
        className="phantom-modal"
        style={modalStyles.modal}
        closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.5)' }} />}
      >
        <div style={modalStyles.modalHeader}>
          <h3 style={modalStyles.modalTitle}>Deposit</h3>
        </div>
        <div style={modalStyles.modalContent}>
          <div style={modalStyles.addressBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={modalStyles.label}>Your wallet address</span>
              <button style={modalStyles.copyButton} onClick={handleCopyAddress}>
                <CopyOutlined /> Copy
              </button>
            </div>
            <p style={modalStyles.addressText}>{wallet}</p>
          </div>
          <div style={modalStyles.qrContainer}>
            <QrcodeOutlined style={{ fontSize: '180px', color: '#141414' }} />
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', fontSize: '14px', marginTop: '24px' }}>
            Send only supported tokens to this address
          </p>
        </div>
      </Modal>

      <Modal
        visible={buyModalVisible}
        onCancel={() => setBuyModalVisible(false)}
        footer={null}
        centered
        className="phantom-modal"
        style={modalStyles.modal}
        closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.5)' }} />}
      >
        <div style={modalStyles.modalHeader}>
          <h3 style={modalStyles.modalTitle}>Buy Crypto</h3>
        </div>
        <div style={modalStyles.modalContent}>
          <div style={{ marginBottom: '24px' }}>
            <label style={modalStyles.label}>Select Token</label>
            <Select
              style={modalStyles.select}
              placeholder="Select token"
              onChange={(value) => setSelectedToken(value)}
              dropdownStyle={{ 
                background: '#141414', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
              }}
              optionLabelProp="label"
            >
              {tokens.map(token => (
                <Select.Option key={token.symbol} value={token.symbol} label={token.symbol}>
                  <div style={modalStyles.tokenOption}>
                    <img src={token.logo} alt={token.symbol} style={modalStyles.tokenIcon} />
                    <span style={{ color: '#fff' }}>{token.symbol}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={modalStyles.label}>Amount (USD)</label>
            <Input
              prefix={<DollarOutlined style={{ color: 'rgba(255, 255, 255, 0.5)' }} />}
              placeholder="Enter amount"
              style={modalStyles.input}
            />
          </div>
          <Button type="primary" style={modalStyles.button}>
            Continue to Payment
          </Button>
        </div>
      </Modal>

      <Modal
        visible={sendModalVisible}
        onCancel={() => setSendModalVisible(false)}
        footer={null}
        centered
        className="phantom-modal"
        style={modalStyles.modal}
        closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.5)' }} />}
      >
        <div style={modalStyles.modalHeader}>
          <h3 style={modalStyles.modalTitle}>Send</h3>
        </div>
        <div style={modalStyles.modalContent}>
          <div style={{ marginBottom: '24px' }}>
            <label style={modalStyles.label}>Select Token</label>
            <Select
              style={modalStyles.select}
              placeholder="Select token"
              onChange={(value) => setSelectedToken(value)}
              dropdownStyle={{ 
                background: '#141414', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
              }}
              optionLabelProp="label"
            >
              {tokens.map(token => (
                <Select.Option key={token.symbol} value={token.symbol} label={token.symbol}>
                  <div style={modalStyles.tokenOption}>
                    <img src={token.logo} alt={token.symbol} style={modalStyles.tokenIcon} />
                    <span style={{ color: '#fff' }}>{token.symbol}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={modalStyles.label}>Recipient Address</label>
            <Input
              placeholder="Enter recipient address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              style={modalStyles.input}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={modalStyles.label}>Amount</label>
            <Input
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={modalStyles.input}
              suffix={selectedToken && <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{selectedToken}</span>}
            />
          </div>
          <Button 
            type="primary" 
            style={modalStyles.button}
            onClick={handleSend}
            disabled={!recipientAddress || !amount || !selectedToken}
          >
            Review Send
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default WalletView;
