"use strict";



(function(){
	if(!localStorage.getItem("basket")){
		localStorage.setItem("basket",JSON.stringify([]))
	}
})();


/* ------------------------------------------------- FETCH PRODUCTS ------------------------------------------------- */

async function fetchProducts(){
	const response = await fetch('https://dummyjson.com/products')
	const result = await response.json()
	
	return result.products
}

/* ------------------------------------------------- GET PRODUCTS ------------------------------------------------- */


function getProducts(products){
	let productsList = ""
	for(var i=0;i<products.length;i++){
		productsList += `<div class="product" data-product-id=${i+1}>
			<header class="name">
				<img src=${products[i].thumbnail} data-product-id=${i+1} />
			</header>
			<section class="details">
				<header class=" poppins-extralight">${products[i].title}</header>
				<section class="rateandprice poppins-regular">
					<div class="productRating">${products[i].rating} / 5</div>
					<div class="productPrice">$ ${products[i].price}</div>
					<div data-product-id=${i+1} class="addBasketOne addBasketButton">Add Basket</div>
				</section>
			</section>
		</div>
		`;
	}
	
	return productsList
	
}

/* ------------------------------------------------- GET PRODUCT DETAILS ------------------------------------------------- */


function getProductDetails(){
	$(".name img").each(function(i){
		$(this).on("click",{x:i},async function(x){
			const response = await fetch(`https://dummyjson.com/products/${x.target.dataset.productId}`)
			const product = await response.json()
			
			
			if(product){
				$(".productDetails").css("display","flex").html(
				`<div class="detailsModal">
				<h1 class="exitButton poppins-regular">x</h1>
				<header class="detailsModalHeader poppins-extralight">${product.title}</header>
				<section class="detailsModalSection">
					<div class="image">
						<img src=${product.images[0]} />
					</div>
					<table>
						<tbody>
							<tr>
								<th class="poppins-regular">Category</th>
								<td class="poppins-extralight">${product.category}</td>
							</tr>
							<tr>
								<th class="poppins-regular">Availability Status</th>
								<td class="poppins-extralight">${product.availabilityStatus}</td>
							</tr>
							<tr>
								<th class="poppins-regular">Shipping Information</th>
								<td class="poppins-extralight">${product.shippingInformation}</td>
							</tr>
							<tr>
								<th class="poppins-regular">Stock</th>
								<td class="poppins-extralight">${product.stock}</td>
							</tr>
							<tr>
								<th class="poppins-regular">Warranty Information</th>
								<td class="poppins-extralight">${product.warrantyInformation}</td>
							</tr>
							<tr>
								<th class="poppins-regular">Rating</th>
								<td class="poppins-extralight">${product.rating}</td>
							</tr>
						</tbody>
					</table>
				</section>
				<footer class="detailsModalFooter">
					<header class="poppins-regular">Price <span class="price poppins-extralight">$ ${product.price}</span></header>
					<div class="addBasketTwo addBasketButton poppins-extralight" data-product-id=${i+1} >Add Basket</div>
				</footer>
			</div>`)
			}
			
			$(".exitButton").click(() =>{
				$(".productDetails").css("display","none")
			})
			
			$(".addBasketTwo").each(function(i){
				$(this).on("click",{x:i},async function(x){					
					addToBasket(x.target.dataset.productId)
				})
			})
			
			
			
		})
	})
}

/* ------------------------------------------------- ADD TO BASKET ------------------------------------------------- */

async function addToBasket(productID){
	const response = await fetch(`https://dummyjson.com/products/${productID}`)
	const product = await response.json()
	
	
	if(product){
		let chosenProduct = {
			title:product.title,
			category:product.category,
			thumbnail:product.thumbnail,
			price:Number(product.price.toFixed(2)),
			count:1
		}
		
		let basketDB = JSON.parse(localStorage.getItem("basket"))
		
				
		if(basketDB.findIndex(product => product.title === chosenProduct.title) !== -1){
			const plusCount = basketDB.find(product => product.title === chosenProduct.title)
			plusCount.count += 1;
			plusCount.price += chosenProduct.price
			basketDB = [...basketDB.map(product => product.title === chosenProduct.title ? ({...plusCount}) : product)]
			localStorage.setItem("basket",JSON.stringify([...basketDB]))
		}else{
			localStorage.setItem("basket",JSON.stringify([...basketDB,chosenProduct]))
		}
		
	}
	
	fetchBasket()
}

/* ------------------------------------------------- REMOVE FROM BASKET ------------------------------------------------- */

async function removeFromBasket(productID){
	let basketDB = JSON.parse(localStorage.getItem("basket"))
	
	if(basketDB.findIndex(product => product.title === productID) !== -1){
		const plusCount = basketDB.find(product => product.title === productID)
		const minusPrice = plusCount.price / plusCount.count;
		plusCount.count -= 1;
		plusCount.price -= minusPrice
		if(plusCount.count === 0){
			basketDB = basketDB.filter(product => product.title !== productID)
			localStorage.setItem("basket",JSON.stringify([...basketDB]))
		}else{
			basketDB = [...basketDB.map(product => product.title === productID ? ({...plusCount}) : product)]
			localStorage.setItem("basket",JSON.stringify([...basketDB]))
		}
		
	}
	
	fetchBasket()
}



/* ------------------------------------------------- FETCH BASKET ------------------------------------------------- */

async function fetchBasket(){
	$(".basketProducts").html("")
	const basketDB = JSON.parse(localStorage.getItem("basket"))
	

	
	for(var i=0;i<basketDB.length;i++){
		$(".basketProducts").append(`
		<div class="basketProduct poppins-regular">		
			<header class="basketProductHeader">
				<img src=${basketDB[i].thumbnail} width="40" height="40">
			</header>
			<section class="basketProductSection">
				<header>
					<div>${basketDB[i].title}</div>
					<div>${basketDB[i].category}</div>
				</header>
				<section>
					<div>Total Price : ${basketDB[i].price.toFixed(2)}</div>
					<div>Total Count : ${basketDB[i].count}</div>
				</section>
			</section>
			<footer  
			class="basketProductFooter"
			data-basket-product-name="${basketDB[i].title}">
				-
			</footer>
		</div>
		`	)
	}
	
	$(".basketProductFooter").each(function(i){
		$(this).on("click",{x:i},function(x){
			removeFromBasket($(this)[0].dataset.basketProductName)
		})
	})
		
		 
	
	
	
}



/* ------------------------------------------------- WINDOW ONLOAD ------------------------------------------------- */

$(window).on("load",async() => {
	const products = await fetchProducts()

	
	if(products){
		$('.products').append(getProducts(products))
		fetchBasket()
	}
	
	
	$("#searchButton").on("click",function(){	
		const searchTag = $("#searchProduct").val()
	
	
	
		setTimeout(async() =>{
			const searchedProduct = await fetch(`https://dummyjson.com/products/search?q=${searchTag}`)
			let foundedProducts = await searchedProduct.json()
			
			
			if(foundedProducts){
				$(".products").html("")
				const {products} = foundedProducts
				if(products){
					$('.products').append(getProducts(products))
					fetchBasket()
				}
				
				getProductDetails()
				
				$(".addBasketOne").each(function(i){
					$(this).on("click",{x:i},async function(x){
						addToBasket($(this).parents(".product")[0].dataset.productId)
					})
				})
	
			}

			
		},1000) 
		
		
		
	})
	
	
	
	
	$(".addBasketOne").each(function(i){
		$(this).on("click",{x:i},async function(x){
			addToBasket($(this).parents(".product")[0].dataset.productId)
		})
	})
	
	$(".openBasketButton").click(() =>{
		$(".basket").toggle()
	})
	
	getProductDetails()
	
	
	
	
		
})


