class Cache::TopDefendantRutsCache
  REDIS_KEY = 'deepleagal_cache:top_defendant_ruts'.freeze

  class << self
    def save_all
      User.all.find_each { |user| save(user.id) }

      true
    end

    def save(user_id)
      $redis.hset(REDIS_KEY, user_id, cacheable_json(User.find(user_id)))

      true
    end

    def get(user_id)
      JSON.parse($redis.hget(REDIS_KEY, user_id.to_s), symbolize_names: true)
    end

    private

    def cacheable_json(user)
      whitelisted_litigators = Laboral::Litigant.where(
        Rut: user.whitelisted_litigators.pluck(:rut),
        Persona: 2
      )

      return unless whitelisted_litigators

      data = user_data(whitelisted_litigators)

      {
        data: data[:users_array],
        total: data[:total],
        updated_at: Time.now.to_i
      }.to_json
    end

    def user_data(whitelisted_litigators)
      total = 0
      ruts_data = nil
      data = whitelisted_litigators.group_by(&:Rut)
        .each_with_object([]) do |(rut, litigators), memo|
          if rut == "0-0"
            litigators.group_by(&:Id).values.each do |l|
              ruts_data = ruts_hash(rut, l)
              memo << ruts_data
              total += ruts_data[:count]
            end
          else
            ruts_data = ruts_hash(rut, litigators)
            memo << ruts_data
            total += ruts_data[:count]
          end
        end

      {
        users_array: data.map do |kase|
          kase.merge(percentage: "#{(kase[:count].to_f / total * 100).round(3)}%")
        end,
        total: total
      }
    end

    def ruts_hash(rut, litigators)
      cases = Laboral::Case.where(Id: litigators.pluck(:Id))
      quarter = nil
      if cases.present?
        first_case = cases.order(:'Fecha Ingreso' => 'ASC').first
        quarter = Time.at(first_case.read_attribute('Fecha Ingreso')).beginning_of_quarter.to_i
      end
      count = cases.count
      {
        rut: rut,
        count: count,
        quarter: quarter,
        name: litigators.first.Nombre
      }
    end
  end
end