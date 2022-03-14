
const getMaxMinAvg = arr => {
	 if ( arr && arr.length ){}
	 else {return [ null , null , null , null ]}
	let max =+ arr[0];
	let min =+ arr[0];
	let sum =+ arr[0];
	let idxminval = 0
	for (var i = 1; i < arr.length; i++){		
		let el = + arr[ i ]
		if ( el > max){
			max = el 
		}
		if ( el < min){
			min = el 
			idxminval = i 
		}
		sum = sum + el 
	}
	return [max, min, sum / arr.length , idxminval ]
}

module.exports={
	getMaxMinAvg 
}
