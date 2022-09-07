const { Router } = require("express");
const axios = require("axios");
const { Pokemon, Tipo, Op } = require("../db.js");

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

// router.use('/', (req, res)=>{
//     res.send('hola mundo')
// });

//obtener todos los personajes, funcion para que espere a que termine el recorrido
const asyncForEach = async (array, callback) => {
  //recorro un for normal
  for (let index = 0; index < array.length; index++) {
    //espero a que se ejecute el callback
    await callback(array[index], index, array);
  }
};
router.get("/pokemons", async (req, res) => {
  const { name, attack, value } = req?.query;
  

  let aux = [];
  try {
    //peticion lista pokemones
    const listPokemons = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=40"
    );
    //obteniendo la info de pokemones
    await asyncForEach(listPokemons.data.results, async (pokemon) => {
      let url = pokemon.url;
      //peticion de los detalles de pokemones
      const detailPokemon = await axios.get(url);

      //obj imagen
      let sprites = detailPokemon.data.sprites.other;

      //obteniendo imagen
      let imagen;
      let imagen2;
      for (const sprite in sprites) {
        //console.log(sprites.dream_world)
        if (sprite === "official-artwork") {
          imagen = sprites["official-artwork"].front_default;
        }
        if (sprite === "dream_world") {
          imagen2 = sprites.dream_world.front_default;
        }
      }
      //objeto pokemon
      const obj = {
        id: detailPokemon.data.id,
        name: detailPokemon.data.name,
        life: detailPokemon.data.stats[0].base_stat,
        attack: detailPokemon.data.stats[1].base_stat,
        defending: detailPokemon.data.stats[2].base_stat,
        speed: detailPokemon.data.stats[5].base_stat,
        height: detailPokemon.data.height,
        weight: detailPokemon.data.weight,
        image: imagen,
        image2: imagen2,
        type: detailPokemon.data.types
          ? detailPokemon.data.types.map((element) => element.type.name)
          : detailPokemon.data.tipos.map((element) => element.name),
      };
      aux.push(obj);
      return aux;
      //console.log('aux',aux)
    });

    //pedido a la base de datos
    //esperar a que nuestro modelo nos haga un findALL
    const db = await Pokemon.findAll({ include: [{ model: Tipo }] });

    //combinar resultados
    let joinArrays = [...aux, ...db];

    if(value){
      let pokemonValue = joinArrays.filter((element)=>  { 
        if(Number(value)){
          return element.attack == Number(value)
          }else{
            return element.name.includes(value) 
          };
        });
    pokemonValue.length > 0
      ? res.status(201).json({
          success: true,
          data: pokemonValue,
        })
      : res.status(400).json({ msg: "El pokemon no existe" });

    }else{
      res.status(201).json({
        success: true,
        data: joinArrays,
      });
    }
   } catch (error) {
    res.status(400).json({
      success: false,
      err: error.message,
    });
  };
});

//obtener los personajes por id
router.get("/pokemons/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) res.status(400).send("No existe el ID");
  try {
    //validar si es UUID, si no es no entra a este if y busca a la api
    //id de db
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) 
    {
      const pokemonDb = await Pokemon.findByPk(id, {
        include: [{ model: Tipo }],
      });
      res.status(201).json({
        success: true,
        data: pokemonDb,
      });
    }
    //id de Apipokemon
    const pokemonId = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${id}`
    );

    //obj imagen
    let sprites = pokemonId.data.sprites.other;

    //obteniendo imagen
    let imagen;
    let imagen2;
    for (const sprite in sprites) {
      if (sprite === "official-artwork") {
        imagen = sprites["official-artwork"].front_default;
      }
      if (sprite === "dream_world") {
        imagen2 = sprites.dream_world.front_default;
      }
    }

    //objeto pokemon
    const obj = {
      name: pokemonId.data.name,
      life: pokemonId.data.stats[0].base_stat,
      attack: pokemonId.data.stats[1].base_stat,
      defending: pokemonId.data.stats[2].base_stat,
      speed: pokemonId.data.stats[5].base_stat,
      height: pokemonId.data.height,
      weight: pokemonId.data.weight,
      image: imagen,
      image2: imagen2,
      type: pokemonId.data.types.map((element) => element.type.name),
    };
    //console.log(obj)
    res.status(201).json({
      success: true,
      data: obj,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      err: error.message,
    });
  }
});

router.post("/pokemons", async (req, res) => {
  const { name, life, attack, defending, speed, height, weight, image, tipos} = req.body;
  if (!name) {
    return res.status(404).send("Faltan completar datos");
  }

  let existPoke = await Pokemon.findOne({
    where: {
      name : name
    }
  });

  if(existPoke) return res.status(404).send("Ya existe ese pokemon")

  try {
    const newPokemon = await Pokemon.create({
      name,
      life,
      attack,
      defending,
      speed,
      height,
      weight,
      tipos,
      image,
  
    });

    //metodos que se crean apartir de la relacion de muchos a muchos en db, nos da las herramientas para que manejemos la info
    //console.log(newPokemon.__proto__)
    //setTipos() los setea, los pisa , a diferecia de addTipos
    newPokemon.setTipos(tipos);

    res.status(201).json({
      success: true,
      msg: "¡Pokemon creado con exito, puede seguir creando y usar su imaginacion!",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      err: error.message,
    });
  }
});



//types api
router.get("/types", async (req, res) => {
  try {
    //peticion de tipos
    const dataTypes = await axios.get("https://pokeapi.co/api/v2/type");
    //console.log(dataTypes.data.results)
    //espera a obtener todos los tipos
    await asyncForEach(dataTypes.data.results, async (type) => {
      //espera a buscar o intenta encontrar una tabla si no la encuentra la crea
      //para cuando pida los tipos no me los cree a cada momento
      await Tipo.findOrCreate({
        where: {
          name: type.name,
        },
      });
    });
    //buscar todos los tipos
    let findTypes = await Tipo.findAll();
    res.status(201).json({
      success: true,
      data: findTypes,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      err: error.message,
    });
  }
});

// router.put('/pokemons/:id' , async(req, res)=> {
//   const {id} = req.params;
//   const body = req.body
//   try {
//     await Pokemon.update(body, {
//     where :{
//      id: id
//     }});
//     return res.json({cambiado: true})
//   } catch (error) {
//     console.log(error)
//   }

// });

// router.delete('/pokemons/:id', async(req, res)=> {
//   const {id} = req.params;
//   try {
//     await Pokemon.destroy({
//     where :{
//      id: id
//     }});
//     return res.json({borrado: true})
//   } catch (error) {
//     console.log(error)
//   }
// })

// router.post('/typescreated', async(req, res)=> {
//   const { name } = req.body;
//  if(!name) res.status(400).send("Type name is required")
//   try {
    
//     let exists = await Tipo.findOne({
//       where: {
//         name: name
//       }
//     });
//     if(exists) res.status(400).send("Tipo already exist")

//     let newType = await Tipo.create({
//       name
//     })
    
//     if(newType){
//       res.status(201).json({
//         success: true,
//         data : newType,
//         msg: "¡Tipo creado con exito, puede seguir creando y usar su imaginacion!",
//       });

//     }
//   } catch (error) {
//     res.status(404).json({
//       success: false,
//       err: error.message,
//     });
//   }

// })

module.exports = router;
