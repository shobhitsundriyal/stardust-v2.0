import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Card from './Card'
import {
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Pie,
	PieChart,
	Cell,
} from 'recharts'
import defaultData from '../defaultResp.json'
import Papa from 'papaparse'

function Dashboard() {
	let sentimentUrl = 'http://34.211.151.159:8080/sentiment/text?text='
	// let nftPriceUrl =
	// 	'http://54.200.253.193:8080/nft/collection?chain_id=1&collection_address=0xd07dc4262bcdbf85190c01c996b4c06a461d2430'
	let ENSAddr = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'.toLowerCase()

	let nftDataUrl =
		'https://docs.google.com/spreadsheets/d/1DhmTUkzc2Yjxgx6jJ7qHEuPnqBR7_cTwQms2Qv651Wc/export?format=csv'

	var today = new Date()
	var dd = String(today.getDate() - 1).padStart(2, '0')
	var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
	var yyyy = today.getFullYear()

	today = yyyy + '-' + mm + '-' + dd
	// console.log(today)

	// data to send
	const [collectioName, setCollectionName] = useState('-')
	const [symbol, setSymbol] = useState('-')
	const [currFloor, setCurrFloor] = useState(0)
	const [noTokens, setNoTokens] = useState(0)

	const [selectedChainId, setSelectedChainId] = useState(1)
	const [lineChartData, setLineChartDate] = useState([])
	const [logoUrl, setLogoUrl] = useState('')
	const [pieChartData, setPieChartData] = useState([
		{ sentiment: 'positive', value: 67 },
		{ sentiment: 'negetive', value: 33 },
	])
	//positive == mint, negitive == transfer
	const colors = ['#34d399', '#A855F7']

	useEffect(async () => {
		setCollectionName(defaultData.collection_name)
		setSymbol(defaultData.collection_ticker_symbol)
		setCurrFloor(defaultData.current_7day_floor_price)
		setNoTokens(defaultData.number_nfts_in_collection)
		setLineChartDate(defaultData.floor_price_hist.reverse())
		// setLineChartDate()
		let minted = 0,
			transfered = 0
		let nftData

		let otherLineData = []
		let dates = []
		let count = 0
		let isFirst = true
		await axios.get(nftDataUrl).then((resp) => {
			// resp.data
			nftData = Papa.parse(resp.data, { header: true }).data
			nftData.map((item) => {
				// console.log(item.to == ENSAddr, item.to, ENSAddr)
				if (item['to'] === ENSAddr || item['from'] === ENSAddr) {
					// console.log('ll')
					item.value > 0 ? (minted += 1) : (transfered += 1)
					// isFirst && dates.push(item.block_timestamp.substring(0, 11))

					if (
						dates != [] &&
						dates.includes(item.block_timestamp.substring(0, 11))
					) {
						count += 1
					} else {
						otherLineData.push({
							transactions: count,
							date: dates[dates.length - 1],
						})
						count = 0
						dates.push(item.block_timestamp.substring(0, 11))
					}
					// console.log(item.block_timestamp.substring(0, 11))
					console.log(otherLineData)
				}
			})
			console.log(minted, transfered)

			setLineChartDate(otherLineData)
			setPieChartData([
				{ sentiment: 'positive', value: minted },
				{ sentiment: 'negetive', value: transfered },
			])
		})
		//get name and other stuff from covalant
		let chainId = 1
		// console.log(
		// 	`${process.env.REACT_APP_COVALANT_URL}${chainId}/tokens/${ENSAddr}/nft_token_ids/?key=${process.env.REACT_APP_COVALANT_API_KEY}`
		// )
		await axios
			.get(
				`${process.env.REACT_APP_COVALANT_URL}${chainId}/tokens/${ENSAddr}/nft_token_ids/?key=${process.env.REACT_APP_COVALANT_API_KEY}`
			)
			.then((resp) => {
				// console.log(resp.data.data.items[0])
				let contractMeta = resp.data.data.items[0]
				setCollectionName(contractMeta.contract_name)
				setSymbol(contractMeta.contract_ticker_symbol)
				setLogoUrl(contractMeta.logo_url)
			})

		await axios
			.get(
				`${process.env.REACT_APP_COVALANT_URL}${chainId}/nft_market/collection/${ENSAddr}/?quote-currency=USD&format=JSON&from=${today}&to=${today}&key=${process.env.REACT_APP_COVALANT_API_KEY}`
			)
			.then((resp) => {
				setCurrFloor(resp.data.data.items[0].floor_price_quote_7d)
				setNoTokens(
					resp.data.data.items[0].unique_token_ids_sold_count_day
				)
			})
		// console.log(lineChartData, 'llll')
	}, [])

	async function submitForm(e) {
		e.preventDefault()
		let contractSearch = e.target[1].value
		let chainId = e.target[0].value
		{
			// axios
			// 	.get(
			// 		'http://34.211.151.159:8080/nft/collection?chain_id=' +
			// 			chainId +
			// 			'&collection_address=' +
			// 			contractSearch
			// 	)
			// 	.then((resp) => {
			// 		console.log(resp.data)
			// 		setCollectionName(resp.data.collection_name)
			// 		setSymbol(resp.data.collection_ticker_symbol)
			// 		setCurrFloor(resp.data.current_7day_floor_price)
			// 		setNoTokens(resp.data.number_nfts_in_collection)
			// 		setLineChartDate(resp.data.floor_price_hist.reverse())
			// 		//get sentiments
			// 		axios
			// 			.get(sentimentUrl + collectioName)
			// 			.then((resp) => {
			// 				console.log(resp)
			// 				let pos = resp.data.classifications.filter(
			// 					(obj) => obj.classification === 'Positive'
			// 				).length
			// 				let neg = resp.data.classifications.filter(
			// 					(obj) => obj.classification === 'Negative'
			// 				).length
			// 				setPieChartData([
			// 					{ sentiment: 'positive', value: pos },
			// 					{ sentiment: 'negetive', value: neg },
			// 				])
			// 			})
			// 			.catch((err) => console.log(err))
			// 	})
		}
		let minted = 0,
			transfered = 0
		let nftData
		let otherLineData = []
		let dates = []
		let count = 0
		let isFirst = true
		await axios.get(nftDataUrl).then((resp) => {
			// resp.data
			nftData = Papa.parse(resp.data, { header: true }).data
			nftData.map((item) => {
				if (
					item['to'].toLowerCase() === contractSearch.toLowerCase() ||
					item['from'].toLowerCase() === contractSearch.toLowerCase()
				) {
					// console.log('ll')
					item.value > 0 ? (minted += 1) : (transfered += 1)
					if (
						dates != [] &&
						dates.includes(item.block_timestamp.substring(0, 11))
					) {
						count += 1
					} else {
						otherLineData.push({
							transactions: count,
							date: dates[dates.length - 1],
						})
						count = 0
						dates.push(item.block_timestamp.substring(0, 11))
					}
					// console.log(item.block_timestamp.substring(0, 11))
					console.log(otherLineData)
				}
			})
			console.log(minted, transfered)

			setPieChartData([
				{ sentiment: 'positive', value: minted },
				{ sentiment: 'negetive', value: transfered },
			])
		})

		await axios
			.get(
				`${process.env.REACT_APP_COVALANT_URL}${chainId}/tokens/${contractSearch}/nft_token_ids/?key=${process.env.REACT_APP_COVALANT_API_KEY}`
			)
			.then((resp) => {
				// console.log(resp.data.data.items[0])
				let contractMeta = resp.data.data.items[0]
				setCollectionName(contractMeta.contract_name)
				setSymbol(contractMeta.contract_ticker_symbol)
				setLogoUrl(contractMeta.logo_url)
			})

		await axios
			.get(
				`${process.env.REACT_APP_COVALANT_URL}${chainId}/nft_market/collection/${contractSearch}/?quote-currency=USD&format=JSON&from=${today}&to=${today}&key=${process.env.REACT_APP_COVALANT_API_KEY}`
			)
			.then((resp) => {
				setCurrFloor(resp.data.data.items[0].floor_price_quote_7d)
				setNoTokens(
					resp.data.data.items[0].unique_token_ids_sold_count_day
				)
			})
			.catch((err) => {
				setNoTokens(0)
				setCurrFloor('Very few datapoints')
			})
		e.target[1].value = ''
	}

	const renderLineChart = (
		<LineChart
			width={600}
			height={400}
			data={lineChartData}
			margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
		>
			<Line
				type='monotone'
				dataKey='transactions'
				stroke='#8884d8'
				strokeWidth={2}
				dot={false}
			/>
			{/* <CartesianGrid stroke='#ccc' strokeDasharray='5 5' /> */}
			<XAxis dataKey='opening_date' minTickGap={15} />
			<YAxis />
			<Tooltip />
		</LineChart>
	)

	const dataList =
		selectedChainId == 1 ? (
			<datalist id='contracts'>
				<option value='0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'>
					Ethereum Name Service
				</option>
				<option value='0x4eBC94fd959d2C4B33Ca75963c6b5E95b7bF4a21'>
					Loius Vitton{' '}
				</option>
				<option value='0xd03D2A00148e01FcFfe00E2EC6e94192c35fc0a3'>
					Gucci
				</option>
				{/* <option value='0x1e0e008EeC6D04C52A3945d3Df33D04e06A9C46F'>
					Gutter Punks Flyer{' '}
				</option> */}
			</datalist>
		) : (
			<datalist id='contracts'>
				<option value='0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'>
					h1
				</option>
				<option value='0x1a92f7381b9f03921564a437210bb9396471050c'>
					Cool h2
				</option>
				<option value='0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7'>
					h2{' '}
				</option>
			</datalist>
		)

	return (
		// overflow h=90vh
		<div className='p-8 z-10 h-[100vh] overflow-y-scroll'>
			<form action='submit' onSubmit={(e) => submitForm(e)}>
				<select
					name='chainId'
					id='chainId'
					className='inp text-white'
					onChange={(e) => setSelectedChainId(e.target.value)}
				>
					<option
						value='1'
						className='text-black'
						selected='selected'
					>
						Eth
					</option>
					<option value='2' className='text-black'>
						Harmony
					</option>
					<option value='3' className='text-black'>
						Polygon
					</option>
				</select>
				<input
					type='text'
					placeholder='Contract address'
					className='inp w-96 ml-5 rounded-r-none'
					list='contracts'
					required
				></input>
				{dataList}
				<input
					type='submit'
					value='🔍'
					className='inp rounded-l-none border-l-0 bg-white cursor-pointer'
				/>
			</form>

			{/* cards and data  */}
			<div>
				{/* info cards  */}
				<div className='grid grid-cols-4 mt-20'>
					<Card title={'Collection Name'} data={collectioName} />
					<Card title={'Symbol'} data={symbol} />
					<Card
						title={'Avg. 7d Price'}
						data={currFloor}
						extraData={'USD'}
					/>
					<Card
						title={'Unique tokens Sold Yesterday'}
						data={noTokens}
					/>
				</div>
				{/* plots  */}
				<div className='flex mt-10 space-x-16'>
					<div className='w-[50rem] bg-[#181E4D] rounded-md shadow-xl p-3 flex items-center'>
						{renderLineChart}
						<span className='text-white'>Floor Price in USD</span>
					</div>
					<div className='w-[17rem] bg-white rounded-md shadow-xl p-3'>
						<div className='text-gray-600 text-sm'>
							Last 3 days(Mint vs Transfers)
						</div>
						<div className=''>
							<PieChart width={250} height={250}>
								<Pie
									data={pieChartData}
									dataKey='value'
									nameKey='sentiment'
									cx='50%'
									cy='50%'
									innerRadius={50}
									outerRadius={80}
									fill='#82ca9d'
									paddingAngle={3}
									label
								>
									{pieChartData.map((entry, index) => (
										<Cell
											fill={colors[index % colors.length]}
										/>
									))}
								</Pie>
							</PieChart>
							{/* labels */}
							<div>
								<span className='mr-2 border-[1px] border-black bg-emerald-400 text-emerald-400'>
									00
								</span>
								Transfers
							</div>
							<div className='mt-3'>
								<span className='mr-2 border-[1px] border-black bg-purple-500 text-purple-500'>
									00
								</span>
								Mints
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
