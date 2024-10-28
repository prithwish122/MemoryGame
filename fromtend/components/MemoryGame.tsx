"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserProvider, ethers } from "ethers";
import ContractABI from "../contractData/contractABI.json";
import address from "../contractData/address.json"

declare global {
  interface Window {
    ethereum?: any; // Declare the ethereum object
  }
}

const generateDeck = () => {
  const memoryCards = [
    "dwarf",
    "orc-connector",
    "elf",
    "orcish-ai-nextjs-framework",
    "orcishcity",
    "orcishlogo",
    "orcishmage",
    "textualgames",
  ];

  const deck = [...memoryCards, ...memoryCards];
  return deck.sort(() => Math.random() - 0.5);
};

// Welcome popup content
const WELCOME_STEPS = [
  {
    title: "Welcome to Memory Quest! 🎮",
    description: "Get ready for an epic memory challenge in the magical realm.",
    icon: "🎯"
  },
  {
    title: "How to Play",
    description: "Match pairs of cards to earn points and unlock special rewards.",
    icon: "📜"
  },
  {
    title: "Earn Rewards",
    description: "Complete the game to earn Memory Tokens and rare NFT cards!",
    icon: "🏆"
  }
];

export default function MemoryGame() {
  const [cards, setCards] = useState<string[]>(generateDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [wallet, setWallet] = useState<string>("");
  const [showReward, setShowReward] = useState(false);
  const [score, setScore] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [tipMessage, setTipMessage] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [quest, setQuest] = useState<ethers.Contract | undefined>(undefined);


  const handleWithdraw = async () => {
    // Withdraw logic here (You can call your contract function or any other logic)


    // alert('Withdraw function triggered! Implement your logic here.');

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner()
    const questContract = new ethers.Contract(address.address, ContractABI.abi, signer)
    setQuest(questContract);
    // mint();
    // console.log(balance, "========inside withdraw===")

    await (await questContract.mint(walletAddress, ethers.parseUnits((1).toString(), 18))).wait();
    alert('Claim Successfull !! Check our wallet');

  };



  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };




  useEffect(() => {
    const checkForMatch = () => {
      const [first, second] = flipped;

      if (cards[first] === cards[second]) {
        setSolved([...solved, ...flipped]);
        setScore(prev => prev + 100);
        showGameTip("Perfect Match! +100 points 🌟");
      } else {
        showGameTip("Try again! 🔄");
      }
      setFlipped([]);
    };

    if (flipped.length === 2) {
      setTimeout(() => {
        checkForMatch();
      }, 1000);
    }
  }, [cards, flipped, solved]);

  const showGameTip = (message: string) => {
    setTipMessage(message);
    setShowTip(true);
    setTimeout(() => setShowTip(false), 2000);
  };

  const handleClick = (index: number) => {
    if (!flipped.includes(index) && flipped.length < 2 && !solved.includes(index)) {
      setFlipped([...flipped, index]);
    }
  };

  const gameOver = solved.length === cards.length;

  const resetGame = () => {
    setCards(generateDeck());
    setFlipped([]);
    setSolved([]);
    setScore(0);
    setShowReward(false);
  };

  // const handleWalletConnect = async () => {
  //   const response = await connectWallet();
  //   setWallet(response.address);
  // };

  // const handleClaimRewards = () => {
  //   setShowReward(true);
  // };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm"
      >
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="flex items-center"
        >
          <Image
            src="/memory-cards/orcishlogo.webp"
            width={40}
            height={40}
            alt="Game Logo"
            className="rounded-full"
          />
          <span className="ml-2 text-xl font-bold text-white">Memory Quest</span>
        </motion.div>
        {!walletConnected ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium"
        >
          Connect Wallet
        </motion.button>
        ) : (
          <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium"
        >
          <span >{walletAddress.slice(0, 5) + '...' + walletAddress.slice(-4)}</span>
        </motion.button>
        )}
      </motion.nav>

      <div className="container mx-auto px-4 py-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Memory Quest
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-white mb-4"
        >
          Score: {score}
        </motion.div>

        <motion.div 
          className="grid grid-cols-4 gap-5 max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {cards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square"
            >
              <motion.div
                className="w-full h-full cursor-pointer"
                animate={{
                  rotateY: flipped.includes(index) || solved.includes(index) ? 180 : 0,
                }}
                transition={{ duration: 0.6 }}
                onClick={() => handleClick(index)}
              >
                <div className={`absolute w-full h-full rounded-xl ${
                  flipped.includes(index) || solved.includes(index)
                    ? "bg-transparent"
                    : "bg-gradient-to-br from-purple-500 to-blue-500"
                } flex items-center justify-center text-4xl font-bold text-white`}>
                  {flipped.includes(index) || solved.includes(index) ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={`/memory-cards/${card}.webp`}
                        fill
                        alt="Memory Card"
                        className="rounded-xl object-cover"
                        style={{ transform: 'rotateY(180deg)' }}
                      />
                    </div>
                  ) : (
                    "?"
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium mt-8"
        >
          Restart Game
        </motion.button>

        {/* Welcome Tutorial Popup */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-purple-800 to-blue-800 p-8 rounded-2xl text-white max-w-md w-full mx-4 relative"
              >
                <motion.div
                  key={currentStep}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">{WELCOME_STEPS[currentStep].icon}</div>
                  <h2 className="text-3xl font-bold mb-4">{WELCOME_STEPS[currentStep].title}</h2>
                  <p className="mb-8">{WELCOME_STEPS[currentStep].description}</p>
                </motion.div>
                
                <div className="flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : null}
                    className={`px-4 py-2 rounded-lg ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'bg-white/20'}`}
                  >
                    Previous
                  </motion.button>
                  
                  <div className="flex gap-2">
                    {WELCOME_STEPS.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentStep ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (currentStep < WELCOME_STEPS.length - 1) {
                        setCurrentStep(currentStep + 1);
                      } else {
                        setShowWelcome(false);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg"
                  >
                    {currentStep < WELCOME_STEPS.length - 1 ? 'Next' : 'Start Game'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Game Tip Popup */}
          {showTip && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-xl text-white font-medium shadow-lg"
            >
              {tipMessage}
            </motion.div>
          )}

          {/* Game Over Modal */}
          {gameOver && !showReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gradient-to-br from-purple-800 to-blue-800 p-8 rounded-xl text-white max-w-md w-full mx-4"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold mb-4">🎉 Congratulations!</h2>
                  <p className="mb-4">You've completed the game with a score of {score}!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    // onClick={handleClaimRewards}
                    onClick={handleWithdraw}  
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white font-medium"
                  >
                    Claim Rewards
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Rewards Modal */}
          {showReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gradient-to-br from-purple-800 to-blue-800 p-8 rounded-xl text-white max-w-md w-full mx-4"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold mb-4">🏆 Rewards Claimed!</h2>
                  <p className="mb-4">You've earned:</p>
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="list-disc list-inside mb-4 space-y-2"
                  >
                    <li className="flex items-center gap-2">
                      <span className="text-xl">🪙</span> 1 Memory Token
                    </li>
                    {/* <li className="flex items-center gap-2">
                      <span className="text-xl">🎴</span> 1 Rare NFT Card
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-xl">🏅</span> Special Achievement Badge
                    </li> */}
                  </motion.ul>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium"
                  >
                    Play Again
                  </motion.button>
                
                  </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Progress Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-800 to-blue-800 p-4 rounded-xl text-white"
          >
            <div className="text-sm mb-2">Progress</div>
            <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(solved.length / cards.length) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs mt-1 text-white/80">
              {Math.floor((solved.length / cards.length) * 100)}% Complete
            </div>
          </motion.div>

          {/* Combo Counter */}
          {score > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed top-24 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-xl text-white"
            >
              <div className="text-2xl font-bold">{Math.floor(score / 100)}x</div>
              <div className="text-sm">Combo</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}