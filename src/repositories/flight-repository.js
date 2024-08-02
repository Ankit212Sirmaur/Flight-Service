const CrudRepository = require('./crud-repository');
const { Flight, Airplane, Airport, City } = require('../models')
const { Op, Sequelize, col } = require('sequelize');
const { on } = require('nodemon');

class FlightRepository extends CrudRepository {
    constructor() {
        super(Flight)
    }

    async getAllFlights(data, sort) {
        const response = await Flight.findAll({
            where: data,
            order: sort,
            include: [
                {
                    model: Airplane,
                    required: true, // outer join to inner join
                    as: 'airplaneDetail',
                },
                {
                    model: Airport,
                    required: true,
                    as: 'departureAirport',
                    on: {           // on the specific column
                        col1: Sequelize.where(Sequelize.col('Flight.departureAirportId'), "=", (Sequelize.col('departureAirport.code')))
                    },
                    include: {
                        model: City,
                        require: true,
                        as: 'cityDetail',
                    }
                },
                {
                    model: Airport,
                    required: true,
                    as: 'arrivalAirport',
                    on: {           // on the specific column
                        col1: Sequelize.where(Sequelize.col('Flight.departureAirportId'), "=", (Sequelize.col('arrivalAirport.code')))
                    },
                    include: {
                        model: City,
                        require: true,
                        as: 'cityDetail',
                    }
                }
            ]
        })
        return response;
    }

    async updateRemainingSeats(flightId, seats, dec = true) {
        console.log(flightId, seats, dec, 'print all');
        
        const flight = await Flight.findByPk(flightId);
        if (parseInt(dec)) {
            await flight.decrement('totalSeats', { by: seats, returning: true });
        } else {
            await flight.increment('totalSeats', { by: seats, returning: true });
        }
        await flight.reload();
        return flight;
    }
}

module.exports = FlightRepository;