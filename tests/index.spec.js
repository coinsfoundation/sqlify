/*global it describe*/

var makeQuery = require('./../src').sqlify;
var sql = require('./../src').squel;

var expect = require('chai').expect;
// var lme = require('lme');

describe('Testing sqlify', function() {
	it('should make good query (type 2: INSERT)', function(done) {
		var resource = {
			set: {
				name: 'Divya',
				age: 44,
				girl: true
			}
		};
		var chain = sql.insert().into('users');
		makeQuery(chain, resource);

		var query = chain.toString();
		expect(query).to.equal('INSERT INTO users (name, age, girl) VALUES (\'Divya\', 44, TRUE)');
		done();
	});

	describe('testing some actual scenarios >', function() {
		it('case 1 (SELECT field FROM table JOIN JOIN JOIN WHERE cond.)', function(done) {
			var resource = {
				field: [
					'service_types.service_title',
					'service_pricing.service_pricing_title',
					'service_pricing_sub.service_pricing_sub_title',
					'service_pricing_cost.service_pricing_cost',
					'service_pricing_cost.service_pricing_currency'
				],
				join: [
					['service_pricing', null, 'service_types.service_id = service_pricing.service_type'],
					['service_pricing_sub', null, 'service_pricing.service_pricing_id = service_pricing_sub.service_pricing_id'],
					['service_pricing_cost', null, 'service_pricing_sub.service_pricing_sub_id = service_pricing_cost.service_pricing_sub_id']
				],
				where: {
					'service_types.service_id': 'something',
					'service_pricing_cost.service_pricing_currency': 'something else'
				}
			};
			var chain = sql.select().from('users');
			makeQuery(chain, resource);

			var query = chain.toString();
			expect(query).to.equal('SELECT service_types.service_title, service_pricing.service_pricing_title, service_pricing_sub.service_pricing_sub_title, service_pricing_cost.service_pricing_cost, service_pricing_cost.service_pricing_currency FROM users INNER JOIN service_pricing ON (service_types.service_id = service_pricing.service_type) INNER JOIN service_pricing_sub ON (service_pricing.service_pricing_id = service_pricing_sub.service_pricing_id) INNER JOIN service_pricing_cost ON (service_pricing_sub.service_pricing_sub_id = service_pricing_cost.service_pricing_sub_id) WHERE (service_types.service_id=\'something\') AND (service_pricing_cost.service_pricing_currency=\'something else\')');
			done();
		});
		it('case 2 (SELECT field FROM table WHERE cond.)', function(done) {
			var resource = {
				field: [
					'fabric_id',
					'fabric_title'
				],
				where: {
					'fabrics.fabric_type': 'something'
				}
			};
			var chain = sql.select().from('fabrics');
			makeQuery(chain, resource);

			var query = chain.toString();
			expect(query).to.equal('SELECT fabric_id, fabric_title FROM fabrics WHERE (fabrics.fabric_type=\'something\')');
			done();
		});

		it('case 3 (INSERT INTO embroidery_formats (format_title,format_ext,service_type VALUES(\'1\',\'2\',\'3\') RETURNING format_id)', function(done) {
			var resource = {
				set: {
					format_title: 'abc',
					format_ext: 'aa',
					service_type: 1
				},
				returning: ['format_id']
			};
			var chain = sql.insert().into('embroidery_formats');
			makeQuery(chain, resource);

			var query = chain.toString();
			expect(query).to.equal('INSERT INTO embroidery_formats (format_title, format_ext, service_type) VALUES (\'abc\', \'aa\', 1) RETURNING format_id');
			done();
		});

		it('case 4 GROUP BY: (SELECT fabric_id, fabric_title FROM fabrics GROUP BY fabric_id)', function(done) {
			var resource = {
				field: [
					'fabric_id',
					'fabric_title'
				],
				group: ['fabric_id']
			};
			var chain = sql.select().from('fabrics');
			makeQuery(chain, resource);

			var query = chain.toString();
			// lme.w(query);
			expect(query).to.equal('SELECT fabric_id, fabric_title FROM fabrics GROUP BY fabric_id');
			done();
		});

		it('case 5 GROUP BY: (INSERT INTO embroidery_formats (format_title,format_ext,service_type VALUES(\'1\',\'2\',\'3\') RETURNING format_id)', function(done) {
			var resource = {
				field: [
					'name',
					'age'
				],
				group: ['name', 'age']
			};
			var chain = sql.select().from('fabrics');
			makeQuery(chain, resource);

			var query = chain.toString();
			// lme.w(query);
			expect(query).to.equal('SELECT name, age FROM fabrics GROUP BY name, age');
			done();
		});

		it('case 6 ORDER BY: (SELECT id FROM students ORDER BY id ASC, name ASC, age ASC)', function(done) {
			var resource = {
				field: [
					'id'
				],
				order: [{
					field: 'id',
					asc: true
				}, {
					field: 'name',
					asc: false
				}, {
					field: 'age',
				}]
			};
			var chain = sql.select().from('students');
			makeQuery(chain, resource);

			var query = chain.toString();
			// lme.w(query);
			expect(query).to.equal('SELECT id FROM students ORDER BY id ASC, name DESC, age ASC');
			done();
		});

		it('case 7 ERR handling', function(done) {
			var resource = {
				field: [
					'id'
				],
				order: [{
					field: 'id',
					asc: true
				}, {
					field: 'name',
					asc: false
				}, {
					field: 'age',
				}],
				blabla: ['he', 'he']
			};
			var chain = sql.select().from('students');
			// makeQuery(chain, resource);
			// lme.w(query);
			expect(function() {
				makeQuery(chain, resource);
			}).to.throw(Error);
			done();
		});
	});
});
