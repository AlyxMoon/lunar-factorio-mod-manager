import { isVersionHigher } from '@shared/isVersionHigher'

describe('isVersionHigher()', () => {
  it('should return false when all parts of both versions are the same', () => {
    expect(isVersionHigher('1', '1')).toBe(false)
    expect(isVersionHigher('1.42', '1.42')).toBe(false)
    expect(isVersionHigher('12.5.20', '12.5.20')).toBe(false)
  })

  it('should return false when second version is lower', () => {
    expect(isVersionHigher('2', '1')).toBe(false)
    expect(isVersionHigher('2.0', '1.1')).toBe(false)
    expect(isVersionHigher('2.0.0', '1.2.3')).toBe(false)
    expect(isVersionHigher('2.2.0', '2.1.0')).toBe(false)
    expect(isVersionHigher('2.2.0', '2.1.1')).toBe(false)
    expect(isVersionHigher('2.2.3', '2.2.1')).toBe(false)
  })

  it('should return true when second version is higher', () => {
    expect(isVersionHigher('1', '2')).toBe(true)
    expect(isVersionHigher('1.1', '2.0')).toBe(true)
    expect(isVersionHigher('1.2.3', '2.0.0')).toBe(true)
    expect(isVersionHigher('2.1.0', '2.2.0')).toBe(true)
    expect(isVersionHigher('2.1.1', '2.2.0')).toBe(true)
    expect(isVersionHigher('2.2.1', '2.2.3')).toBe(true)
  })
})