import { useState, useEffect, useMemo } from 'react'
import { useMoralis } from 'react-moralis'

export default function CreateOffer() {
  const {
    Moralis,
    user,
    logout,
    authenticate,
    enableWeb3,
    isInitialized,
    isAuthenticated,
    isWeb3Enabled,
  } = useMoralis()

  const web3Account = useMemo(
    () => isAuthenticated && user.get('accounts')[0],
    [user, isAuthenticated]
  )

  const [order, setOrder] = useState({
    contractAddress: '',
    tokenId: '',
    amount: '',
  })

  const [error, setError] = useState(null)

  const getAsset = async () => {
    try {
      const res = await Moralis.Plugins.opensea.getAsset({
        network: 'mainnet',
        tokenAddress: order.contractAddress,
        tokenId: order.tokenId,
      })
      console.log(res)
      return res
    } catch (e) {
      console.log(e)
    }
  }

  async function createBuyOrder() {
    setError(null)
    const asset = await getAsset()
    const tokenType = asset.assetContract.schemaName

    console.log(tokenType)
    console.log(web3Account)
    console.log(order)

    await Moralis.Plugins.opensea.createBuyOrder({
      network: 'mainnet',
      tokenAddress: order.contractAddress,
      tokenId: order.tokenId,
      tokenType: tokenType,
      amount: order.amount,
      userAddress: web3Account,
      paymentTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    })

    console.log('create buy order successful!')
  }

  useEffect(() => {
    if (isInitialized) {
      Moralis.initPlugins()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled) {
      enableWeb3()
    }
    // eslint-disable-next-line
  }, [isAuthenticated])

  return (
    <div>
      {isAuthenticated ? (
        <>
          <div>{web3Account}</div>
          <button onClick={() => logout()}>Logout</button>
        </>
      ) : (
        <button onClick={() => authenticate()}>Connect to Metamask</button>
      )}

      <div className="offer--container">
        <h1>Create Offer</h1>
        <input
          id="input--address"
          value={order.contractAddress}
          onChange={(e) =>
            setOrder((prev) => ({
              ...prev,
              contractAddress: e.target.value,
            }))
          }
          placeholder="enter contract address"
        />
        <input
          id="input--tokenId"
          value={order.tokenId}
          onChange={(e) =>
            setOrder((prev) => ({
              ...prev,
              tokenId: e.target.value,
            }))
          }
          placeholder="enter token id"
        />
        <input
          id="input--amount"
          type="number"
          value={order.amount}
          onChange={(e) =>
            setOrder((prev) => ({
              ...prev,
              amount: Number(e.target.value),
            }))
          }
          placeholder="enter weth amount"
        />
        <button onClick={createBuyOrder}>Create Buy Offer</button>
      </div>
    </div>
  )
}
